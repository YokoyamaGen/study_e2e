import { test, expect } from '@playwright/test';

const TARGET_URL = 'https://careecon.jp/blog/category/construction';

test.beforeEach(async ({ page }) => {
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
});

// ===================================================
// 1. ページ基本情報
// ===================================================

test('ページタイトルに「建設トレンド」が含まれる', async ({ page }) => {
  await expect(page).toHaveTitle(/建設トレンド/);
});

test('パンくずリストが正しく表示される', async ({ page }) => {
  // カード一覧が表示されるまで待ってからパンくずを確認
  await page.locator('.blog-card').first().waitFor();

  // page.getByText はページ全体から部分一致で検索する
  await expect(page.getByText('記事総合').first()).toBeVisible();
  await expect(page.getByText('建設トレンド').first()).toBeVisible();
});

// // ===================================================
// // 2. 記事カード一覧
// // ===================================================

test('記事カードが10件表示される', async ({ page }) => {
  const cards = page.locator('.blog-card');
  await expect(cards).toHaveCount(10);
});

test('各記事カードにタイトルが表示される', async ({ page }) => {
  const headings = page.locator('.blog-card-info__heading');
  // allTextContents() で全テキストを一括取得（非同期ループを避けてタイムアウトを防ぐ）
  const texts = await headings.allTextContents();
  for (const text of texts) {
    expect(text.trim().length, `タイトルが空です: "${text}"`).toBeGreaterThan(0);
  }
});

// ===================================================
// 3. ページネーション
// ===================================================

test('ページネーションが表示される', async ({ page }) => {
  await expect(page.locator('.blog-paginate')).toBeVisible();
});

test('1ページ目がアクティブ状態で表示される', async ({ page }) => {
  const activePage = page.locator('.pager-list .active');
  await expect(activePage).toBeVisible();
  await expect(activePage).toHaveText('1');
});

test('ページ2・3・4へのリンクが表示される', async ({ page }) => {
  const pagerList = page.locator('.pager-list');
  await expect(pagerList.getByRole('link', { name: '2' })).toBeVisible();
  await expect(pagerList.getByRole('link', { name: '3' })).toBeVisible();
  await expect(pagerList.getByRole('link', { name: '4' })).toBeVisible();
});

test('次ページリンクが2ページ目を指す', async ({ page }) => {
  const nextLink = page.locator('.pager-list a').filter({ hasText: 'keyboard_arrow_right' });
  await expect(nextLink).toHaveAttribute('href', /page=2/);
});

test('1ページ目には前ページリンクが存在しない', async ({ page }) => {
  await expect(
    page.locator('.pager-list a').filter({ hasText: 'keyboard_arrow_left' }),
  ).toHaveCount(0);
});

test('次ページリンクをクリックすると2ページ目に遷移する', async ({ page }) => {
  const nextLink = page.locator('.pager-list a').filter({ hasText: 'keyboard_arrow_right' });
  await nextLink.click();
  await page.waitForURL(/page=2/);
  await expect(page.locator('.pager-list .active')).toHaveText('2');
});

test('2ページ目では前ページリンクが表示される', async ({ page }) => {
  await page.goto(`${TARGET_URL}?order=new&page=2`, { waitUntil: 'domcontentloaded' });
  const prevLink = page.locator('.pager-list a').filter({ hasText: 'keyboard_arrow_left' });
  await expect(prevLink).toBeVisible();
  await expect(prevLink).toHaveAttribute('href', /\/blog\/category\/construction/);
});

