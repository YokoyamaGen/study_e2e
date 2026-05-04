# E2E テストガイドライン

## 1. プロダクト概要

**対象サービス**: [careecon.jp](https://careecon.jp/) — 建設業界向けマッチングサービス

仕事はあるが人手が足りない企業と、人手はあるが仕事が少ない企業を繋ぐプラットフォーム。双方にとって業務継続性・収益確保に直結するため、コア機能の信頼性がプロダクト価値そのものとなる。

---

## 2. テスト戦略

### 2.1 優先順位付けの基準

以下の2軸でテスト優先度を決定する。

| 評価軸 | 説明 |
|--------|------|
| **ユーザー価値** | マッチング成立に直結するか、補助的機能か |
| **障害時影響度** | 全ユーザーに影響するか、特定操作のみか |

### 2.2 コアユーザージャーニー

careecon.jp は **元請企業** と **協力会社** の両面マーケットプレイスであるため、それぞれのジャーニーをコアジャーニーとして定義し、全ステップを E2E で必ず保証する。

```
【元請企業】ログイン → 企業検索 → 企業詳細閲覧 → メッセージ送信
【協力会社】ログイン → 案件検索 → 案件詳細閲覧 → メッセージ送信
```

どちらか一方のジャーニーでも障害が発生すると、そのユーザー層のマッチング件数がゼロになる。

### 2.3 テスト対象機能の優先順位

| 優先度 | 機能 | コアジャーニー | 理由 |
|--------|------|:-----------:|------|
| P0（必須） | ログイン / ログアウト | ✓ | 全機能の前提条件。障害時は全ユーザーが利用不能 |
| P0（必須） | 企業検索 | ✓ | 元請企業ジャーニーの起点。最も利用頻度が高いコア機能 |
| P0（必須） | 企業詳細ページ閲覧 | ✓ | 検索結果からメッセージまでの必須ステップ。壊れると検索が死に体になる |
| P0（必須） | 案件検索 | ✓ | 協力会社ジャーニーの起点。障害時は協力会社側のマッチングが全滅する |
| P0（必須） | 案件詳細ページ閲覧 | ✓ | 案件検索からメッセージまでの必須ステップ |
| P0（必須） | メッセージ機能 | ✓ | 両ジャーニーの終点。マッチング成立の唯一の手段 |
| P1（高） | 施工事例作成 | | 受注企業の実績訴求手段。マッチング率に直接影響 |
| P2（中） | プロフィール変更 | | 企業情報の正確性維持。頻度は低いが重要度は高い |

### 2.4 テストスコープ

```
E2E テスト: ハッピーパス（正常系）のみ
単体テスト: 異常系・バリデーション・エッジケース
```

本フェーズでは **ユーザーが価値を享受できる正常なフロー** の動作保証を最優先とする。
入力バリデーション・エラーハンドリング・境界値等の異常系は単体テストで担保し、E2E では扱わない。

---

## 3. テスト設計

### 3.1 Page Object Model (POM)

責務を分離してテストコードの保守性を高めるため、POM を採用する。

**POM を選んだ理由**

careecon.jp のサイト調査から、以下の2つの操作が複数のテストファイルをまたいで繰り返されることが判明した。

| 繰り返し操作 | 発生箇所 |
|---|---|
| OAuthログイン（email + password） | P0全機能の前提：企業検索・企業詳細・メッセージ送信 |
| 業種・カテゴリフィルター（`industry_ids[]` / `category_ids[]`） | `/companies`（企業検索）と `/projects/construction`（案件検索）の両方 |

ログイン操作は P0 の5スペックファイル全てで必要になる。同一ロケーターが散在した状態で OAuth のフォーム構造が変わると、全ファイルの修正が必要になる。POM により `LoginPage.ts` 1ファイルへの変更で済む。

業種・カテゴリフィルターも同様に、2ページで共通のフォーム要素を持つため `SearchPage.ts` に閉じ込めることで重複を排除できる。

```
tests/
  pages/          ← Page Object クラス（DOM 操作・ナビゲーション）
    LoginPage.ts
    SearchPage.ts
    MessagePage.ts
    CasePage.ts
    ProfilePage.ts
  specs/          ← テストシナリオ（アサーションのみ記述）
    login.spec.ts
    search.spec.ts
    message.spec.ts
    case.spec.ts
    profile.spec.ts
```

**Page Object の責務**

- ロケーター定義
- ユーザー操作のラッピング（クリック・入力・送信）
- ページ遷移の待機処理

**Spec ファイルの責務**

- シナリオの組み立て
- `expect` によるアサーション
- `test.beforeEach` でのテスト前提状態の準備

**実装例**

```typescript
// pages/SearchPage.ts
export class SearchPage {
  constructor(private page: Page) {}

  async searchByPrefecture(prefecture: string) {
    await this.page.getByLabel('都道府県').selectOption(prefecture);
    await this.page.getByRole('button', { name: '検索' }).click();
  }

  get results() {
    return this.page.getByRole('list', { name: '検索結果' });
  }
}

// specs/search.spec.ts
test('都道府県で絞り込むと結果が表示される', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.searchByPrefecture('東京都');
  await expect(searchPage.results).toBeVisible();
});
```

---

## 4. コーディング規約

### 4.1 ファイル構成

各スペックファイルの冒頭に `TARGET_URL` 定数を定義する。

```typescript
const TARGET_URL = 'https://careecon.jp/search';
```

`test.beforeEach` でページ遷移を行い、各テストで `page.goto` を繰り返さない。

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
});
```

### 4.2 セレクター選定の優先順位

以下の優先順位でロケーターを選択する。高いものほど変更耐性が高く、テストの意図が明確になる。

| 優先度 | API | 例 |
|--------|-----|-----|
| 1（最優先） | `getByRole` | `getByRole('button', { name: '検索' })` |
| 2 | `getByLabel` | `getByLabel('メールアドレス')` |
| 3 | `getByPlaceholder` | `getByPlaceholder('キーワードを入力')` |
| 4 | `getByText` | `getByText('施工事例を追加')` |
| 5（最終手段） | CSS セレクター | `locator('.search-result-card')` |

CSS セレクターは実装詳細に依存するため、変更耐性が低い。他の手段で特定できない場合のみ使用する。

### 4.3 禁止事項

**インデックスベースのロケーター使用禁止**

```typescript
// NG: データ取得順や API レスポンス速度で順序が変わり不安定
page.locator('.company-card').nth(0)

// OK: テキストや属性で一意に特定する
page.getByRole('article', { name: '株式会社○○' })
```

**非同期ループによるアサーション禁止**

```typescript
// NG: タイムアウトの原因になる
for (const card of await cards.all()) {
  await expect(card).toBeVisible();
}

// OK: allTextContents() で一括取得
const texts = await page.locator('.company-name').allTextContents();
for (const text of texts) {
  expect(text.trim().length).toBeGreaterThan(0);
}
```

**`page.waitForTimeout` の使用禁止**

```typescript
// NG: 実行環境によって不安定
await page.waitForTimeout(2000);

// OK: 要素の出現を待つ
await page.locator('.results').waitFor();
// OK: URL 遷移を待つ
await page.waitForURL(/\/company\/\d+/);
```

### 4.4 テストの独立性

各テストは他のテストの実行結果に依存しない **Shared-nothing** 設計を原則とする。

```typescript
// NG: 前テストでログインしている前提
test('企業を検索できる', async ({ page }) => {
  // ログイン状態を前提にしている
  await page.goto('/search');
});

// OK: beforeEach で必要な状態を毎回セットアップ
test.beforeEach(async ({ page }) => {
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  // 認証が必要な場合はここでログイン処理を行う
});
```

`test.describe.configure({ mode: 'serial' })` は、システム制約上どうしても依存関係が避けられない場合の **最終手段** として使用する。

### 4.5 動的要素への対応

遅延読み込みや非同期更新が伴う要素は、適切な待機処理を挟む。

```typescript
// 画像の遅延読み込み: src より先に data-src を確認
const img = page.locator('.company-logo img');
const dataSrc = await img.getAttribute('data-src');
expect(dataSrc).toBeTruthy();

// スピナーが消えるまで待つ
await page.locator('.loading-spinner').waitFor({ state: 'hidden' });
```

---

## 5. テスト実装前チェックリスト

新規テストを実装・修正する前に、`example-skills:webapp-testing` スキルで対象ページの構造を必ず確認する。

- [ ] スクリーンショットと DOM 構造を取得した
- [ ] 実在する `role`・`text`・`label` を把握した上でロケーターを書いた
- [ ] 動的要素（スピナー・モーダル・遅延読み込み）の有無を確認した
- [ ] テストが他のテストに依存していないことを確認した
- [ ] インデックスベースのロケーターを使用していないことを確認した

---

## 6. 実行コマンド

```bash
npm test                          # 全テスト実行（ヘッドレス・Chromium）
npm run test:headed               # ブラウザを表示して実行
npm run test:ui                   # Playwright UI モード
npm run report                    # HTML レポートを開く
npm run lint                      # テストファイルを lint
npm run lint:fix                  # lint エラーを自動修正
```

特定ファイルの実行:
```bash
npx playwright test tests/specs/search.spec.ts
```

テスト名で絞り込み:
```bash
npx playwright test -g "企業を検索できる"
```
