# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う Claude Code (claude.ai/code) へのガイダンスを提供します。

## コマンド

```bash
npm test                        # 全テスト実行（ヘッドレス・Chromium）
npm run test:headed             # ブラウザを表示して実行
npm run test:ui                 # Playwright UI モードを起動
npm run report                  # HTML レポートを開く
npm run lint                    # テストファイルを lint
npm run lint:fix                # lint エラーを自動修正
```

特定のファイルだけ実行:
```bash
npx playwright test tests/careecon_construction.spec.ts
```

テスト名で絞り込み:
```bash
npx playwright test -g "ページタイトルに"
```

### Docker（ローカルブラウザ不要）

```bash
docker compose up -d            # コンテナ起動
docker compose exec playwright npx playwright test
docker compose down
```

`tests/`・`playwright.config.ts`・`eslint.config.js`・`tsconfig.json` はホストとコンテナ間でライブマウントされており、ホスト側の編集は即座に反映される（イメージの再ビルド不要）。

## アーキテクチャ

- **`tests/`** — 全スペックファイル（`*.ts`）。設定が `**/*.ts` にマッチするため、このディレクトリの `.ts` ファイルはすべてテストとして扱われる。
- **`playwright.config.ts`** — プロジェクトは Chromium Desktop のみ。トレースは常に記録。スクリーンショット・動画は失敗時のみ保持。`retries: 0`。`baseURL` は `https://playwright.dev`（デフォルトのプレースホルダー）で、各テストは独自の `TARGET_URL` 定数で遷移先を指定する。
- **`eslint.config.js`** — フラット設定で `eslint-plugin-playwright` の推奨ルールを適用。スコープは `tests/**/*.ts`。

## テストの慣習

- 各スペックファイルの冒頭で `TARGET_URL` 定数を定義する。
- `test.beforeEach` でページ遷移を行い、各テストで `page.goto` を繰り返さない。
- 複数要素のテキスト確認には非同期ループを避けて `allTextContents()` を使用する（タイムアウト防止）。
- 遅延読み込み画像は `src` より先に `data-src` を確認する。

### ロケーターの指定

- `nth(n)` などインデックスベースのロケーターは**使用しない**。データの読み込み順序や API レスポンス速度によって DOM 上の順序が変わり、テストが不安定になるため。
- ロケーターは `getByRole`・`getByText`・`getByLabel`・`getByPlaceholder` などユーザー向け属性（User-facing attributes）を優先する。
- 要素の一意性が保証されない場合は `name` オプションや `exact: true` を組み合わせて絞り込む。

### テストの独立性と実行順序

- 各テストは他のテストの実行結果に依存しない **Shared-nothing** な設計を原則とする。並列実行時に前テストの状態が残っていると予期しない失敗を招くため。
- テストに必要なデータ準備やページ状態の初期化は `test.beforeEach` で行い、テスト間の状態漏れを防ぐ。
- `test.describe.configure({ mode: 'serial' })` によるシリアルモードは、システム制約上どうしても依存関係が避けられない場合の**最終手段**として使用する。以下の制約を理解した上で採用すること。
  - グループ内の1テストが失敗すると、以降のテストはすべてスキップされる。
  - リトライ時はグループの最初のテストから再試行されるため、実行時間とフィードバックの遅延が増大する。

## テスト実装・修正の進め方

E2E テストを新規実装・修正する前に、必ず `example-skills:webapp-testing` スキルを使ってテスト対象ページの構造を確認すること。

- スクリーンショットと DOM 構造を取得し、実在する `role`・`text`・`label` を把握してからロケーターを書く
- 動的要素（スピナー・モーダル・遅延読み込みなど）の有無を確認し、適切な待機処理を判断する
