# Playwright公式イメージ（ブラウザ込み）
FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

# 依存関係をコピーしてインストール
COPY package.json ./
RUN npm install

# ソースをコピー
COPY . .

# コンテナを起動したまま待機（テストは手動で実行）
CMD ["tail", "-f", "/dev/null"]
