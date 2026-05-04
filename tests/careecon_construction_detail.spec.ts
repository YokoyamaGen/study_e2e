import { test, expect } from '@playwright/test';

const CATEGORY_URL = 'https://careecon.jp/blog/category/construction';

test.describe('建設トレンド 新着記事詳細遷移', () => {
  test('新着一覧の先頭記事の詳細ページが表示される', async ({ page }) => {
    await page.goto(CATEGORY_URL, { waitUntil: 'domcontentloaded' });

    // a.cover-link は新着記事リスト（blog-contents）専用セレクター
    // カルーセルは class なし <a> を使うため、cover-link で絞り込むと新着先頭記事が取得できる
    const firstCoverLink = page.locator('a.cover-link').first();
    await firstCoverLink.click();

    // 詳細ページの URL が /blog/{id} 形式であることを確認
    await expect(page).toHaveURL(/careecon\.jp\/blog\/\d+/);

    // h1 タイトルが表示されていることを確認
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});
