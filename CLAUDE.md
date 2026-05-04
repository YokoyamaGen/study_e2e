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

## E2E テストガイドライン

テスト設計・コーディング規約・実装前チェックリストは [docs/e2e-guidelines.md](docs/e2e-guidelines.md) を参照すること。
