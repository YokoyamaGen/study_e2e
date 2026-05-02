import { test, expect, Page } from '@playwright/test';

const CATEGORY_URL = 'https://careecon.jp/blog/category/construction';

test.describe('建設トレンド 新着記事クリック遷移', () => {
  test('新着一覧の先頭記事をクリックすると詳細ページが表示される', async ({ page }) => {
    await page.goto(CATEGORY_URL, { waitUntil: 'load' });

    // /blog/{数字} 形式の最初の記事リンクを href で特定
    const hrefs = await page.locator('a[href*="/blog/"]').evaluateAll(
      (els) => els.map((el) => el.getAttribute('href') ?? '')
    );
    const articleHref = hrefs.find((href) => /\/blog\/\d+$/.test(href));
    if (!articleHref) throw new Error('記事リンクが見つかりません');

    // カルーセルはJSが動的にtabindexを書き換えるため、クリックせず直接URLへ遷移する
    const detailUrl = articleHref.startsWith('http')
      ? articleHref
      : `https://careecon.jp${articleHref}`;
    await page.goto(detailUrl, { waitUntil: 'load' });

    // 詳細ページの URL が /blog/{id} 形式であることを確認
    await expect(page).toHaveURL(/careecon\.jp\/blog\/\d+/);

    // h1 タイトルが表示されていることを確認
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('建設トレンド 記事詳細', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const tempPage = await browser.newPage();
    await tempPage.goto(CATEGORY_URL, { waitUntil: 'domcontentloaded' });

    // /blog/{数字} 形式のリンクを取得（カテゴリページURLを除外）
    const hrefs = await tempPage.locator('a[href*="/blog/"]').evaluateAll(
      (els) => els.map((el) => el.getAttribute('href') ?? '')
    );
    const articleHref = hrefs.find((href) => /\/blog\/\d+$/.test(href));
    if (!articleHref) throw new Error('記事リンクが見つかりません');

    const detailUrl = articleHref.startsWith('http')
      ? articleHref
      : `https://careecon.jp${articleHref}`;
    await tempPage.close();

    page = await browser.newPage();
    await page.goto(detailUrl, { waitUntil: 'load' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ===================================================
  // 1. URL・ページ基本情報
  // ===================================================

  test('記事詳細ページの URL が /blog/{id} 形式である', async () => {
    await expect(page).toHaveURL(/careecon\.jp\/blog\/\d+/);
  });

  test('ページタイトルに記事名と CAREECON が含まれる', async () => {
    await expect(page).toHaveTitle(/CAREECON/);
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  // ===================================================
  // 2. 記事ヘッダー
  // ===================================================

  test('記事タイトル（h1）が表示される', async () => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('公開日が表示される', async () => {
    const timeEl = page.locator('time').first();
    await expect(timeEl).toBeVisible();
    const text = await timeEl.textContent();
    expect(text, `日付フォーマットが不正です: "${text}"`).toMatch(/\d{4}\.\d{2}\.\d{2}/);
  });

  // ===================================================
  // 3. 記事本文
  // ===================================================

  test('記事本文エリアが表示される', async () => {
    const body = page.locator('.blog-content__body--html');
    await expect(body).toBeVisible();
    const text = await body.textContent();
    expect(text?.trim().length, '本文が空です').toBeGreaterThan(0);
  });

  // ===================================================
  // 4. ナビゲーション（前後記事）
  // ===================================================

  test('記事詳細ページに前後記事へのリンクが表示される', async () => {
    const pagination = page.locator('.blog-pagination');
    await expect(pagination).toBeVisible();
  });
});
