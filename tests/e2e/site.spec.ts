import { expect, test } from '@playwright/test';

test('home has working destinations, readable bounds and a real screenshot', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('数字空间');
  await expect(page.locator('.app-card')).toHaveCount(3);
  await expect(page.locator('body')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('search empty state, Escape, reopening and result navigation', async ({ page }) => {
  await page.goto('/');
  await page.locator('.search-trigger').click();
  const input = page.getByLabel('搜索关键词');
  await input.fill('no-such-entry-2371');
  await expect(page.getByText('还没有相关内容')).toBeVisible();
  await input.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.locator('.search-trigger').click();
  await expect(input).toHaveValue('');
  await input.fill('媒体与引用');
  await page.getByRole('link', { name: /媒体与引用规范/ }).click();
  await expect(page).toHaveURL(/\/docs\/media-guidelines\//);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('topic filter, no results, clear and browser history', async ({ page }) => {
  await page.goto('/blog/');
  await page.getByRole('button', { name: '筛选AI', exact: true }).click();
  await expect(page).toHaveURL(/tag=AI/);
  const input = page.getByLabel('搜索手记');
  await input.fill('no-such-entry-2371');
  await expect(page.getByText('这里还没有相关内容')).toBeVisible();
  await page.getByRole('button', { name: '查看全部内容' }).click();
  await expect(input).toHaveValue('');
  await expect(page.locator('.article-card')).toHaveCount(3);
  await page.locator('.article-card').first().click();
  await expect(page.locator('.reading-surface')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: '技术手记', exact: true })).toBeVisible();
});

test('article anchors resolve and media remains native, labelled and non-autoplay', async ({ page }, testInfo) => {
  await page.goto('/docs/media-guidelines/');
  const anchors = await page.locator('.toc a').evaluateAll(items => items.map(item => item.getAttribute('href')));
  for (const anchor of anchors) {
    expect(anchor).toBeTruthy();
    expect(await page.locator(`[id="${anchor!.slice(1)}"]`).count()).toBe(1);
  }
  const video = page.getByLabel('本地内容工作流示例动画');
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).not.toHaveAttribute('autoplay');
  await expect(video.locator('track')).toHaveAttribute('kind', 'captions');
  await page.screenshot({ path: testInfo.outputPath('article.png'), fullPage: true });
});

test('planned application states remain truthful', async ({ page }) => {
  await page.goto('/apps/');
  await page.locator('.app-card').first().click();
  await expect(page.getByText('规划中，尚未部署')).toBeVisible();
  await expect(page.getByRole('link', { name: /登录|立即开始|打开应用/ })).toHaveCount(0);
});

test('mobile navigation can close, reopen and navigate', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation is only visible below the mobile breakpoint');
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '打开导航' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await trigger.click();
  await page.getByRole('dialog').getByRole('link', { name: '知识文档' }).click();
  await expect(page).toHaveURL(/\/docs\//);
  await expect(page.getByRole('dialog')).toBeHidden();
});
