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

// test('パンくずリストが正しく表示される', async ({ page }) => {
//   // カード一覧が表示されるまで待ってからパンくずを確認
//   await page.locator('.blog-card').first().waitFor();

//   // page.getByText はページ全体から部分一致で検索する
//   await expect(page.getByText('記事総合').first()).toBeVisible();
//   await expect(page.getByText('建設トレンド').first()).toBeVisible();
// });

// // ===================================================
// // 2. 記事カード一覧
// // ===================================================

// test('記事カードが10件表示される', async ({ page }) => {
//   const cards = page.locator('.blog-card');
//   await expect(cards).toHaveCount(10);
// });

// test('各記事カードにタイトルが表示される', async ({ page }) => {
//   const headings = page.locator('.blog-card-info__heading');
//   await expect(headings).toHaveCount(10);

//   // allTextContents() で全テキストを一括取得（非同期ループを避けてタイムアウトを防ぐ）
//   const texts = await headings.allTextContents();
//   for (const text of texts) {
//     expect(text.trim().length, `タイトルが空です: "${text}"`).toBeGreaterThan(0);
//   }
// });

// test('各記事カードにサムネイル画像が表示される', async ({ page }) => {
//   const images = page.locator('.blog-card__img');
//   await expect(images).toHaveCount(10);

//   // lazy load のため src より data-src を確認する
//   // 一部の画像はスクロールして初めて src に切り替わる
//   const dataSrcs = await images.evaluateAll(
//     (imgs) => imgs.map((img) => img.getAttribute('data-src') ?? img.getAttribute('src') ?? '')
//   );
//   for (const src of dataSrcs) {
//     expect(src, 'data-src / src が空です').toMatch(/careecon-production/);
//   }
// });

// test('各記事カードに日付が表示される', async ({ page }) => {
//   const details = page.locator('.blog-card-info__detail');
//   await expect(details).toHaveCount(10);

//   // allTextContents() で一括取得して日付フォーマットを確認
//   const texts = await details.allTextContents();
//   for (const text of texts) {
//     expect(text, `日付が見つかりません: "${text}"`).toMatch(/\d{4}\.\d{2}\.\d{2}/);
//   }
// });

// test('各記事カードに本文の要約が表示される', async ({ page }) => {
//   const summaries = page.locator('.blog-card-info__text');
//   await expect(summaries).toHaveCount(10);

//   const texts = await summaries.allTextContents();
//   for (const text of texts) {
//     expect(text.trim().length, `本文要約が空です`).toBeGreaterThan(0);
//   }
// });

// // ===================================================
// // 3. 記事カードのクリック・遷移
// // ===================================================

// test('記事カードをクリックすると記事詳細ページへ遷移する', async ({ page }) => {
//   // カードは .cover-link (透明なアンカー) で全面が覆われているのでそちらをクリック
//   const coverLink = page.locator('.blog-card .cover-link').first();
//   const href = await coverLink.getAttribute('href');

//   await coverLink.click();
//   await page.waitForLoadState('networkidle');

//   // 記事詳細URLへ遷移していることを確認
//   await expect(page).toHaveURL(/careecon\.jp\/blog\//);
//   if (href) {
//     await expect(page).toHaveURL(new RegExp(href.replace('/', '\\/')));
//   }
// });

// // ===================================================
// // 4. ページネーション
// // ===================================================

// test('ページネーションが表示され、現在ページが1である', async ({ page }) => {
//   const pager = page.locator('.pager-list');
//   await expect(pager).toBeVisible();

//   // 現在ページ (active) が "1"
//   await expect(pager.locator('li.active')).toHaveText('1');
// });

// test('ページネーションに4ページ分のリンクがある', async ({ page }) => {
//   // active(1ページ目) + リンク(2,3,4) + 次へ矢印 = 5要素
//   await expect(page.locator('.pager-list li')).toHaveCount(5);
// });

// test('ページ2へ遷移すると記事が切り替わる', async ({ page }) => {
//   // 1ページ目の最初のタイトルを記録
//   const firstTitle = await page.locator('.blog-card-info__heading').first().textContent();

//   await page.locator('.pager-list a[href*="page=2"]').first().click();
//   await page.waitForLoadState('networkidle');

//   await expect(page).toHaveURL(/page=2/);
//   await expect(page.locator('.blog-card')).toHaveCount(10);

//   // 1ページ目とは異なる記事が表示されている
//   const secondPageFirstTitle = await page.locator('.blog-card-info__heading').first().textContent();
//   expect(secondPageFirstTitle).not.toBe(firstTitle);
// });

// test('次へ矢印でページ2へ遷移できる', async ({ page }) => {
//   // material-icons の矢印を含むリンクをクリック
//   await page.locator('.pager-list a', { has: page.locator('.material-icons') }).click();
//   await page.waitForLoadState('networkidle');

//   await expect(page).toHaveURL(/page=2/);
//   await expect(page.locator('.blog-card')).toHaveCount(10);
// });
