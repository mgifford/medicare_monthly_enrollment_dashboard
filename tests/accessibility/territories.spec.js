import { test, expect } from '@playwright/test';

test.describe('Territory behavior', () => {
  test('territories appear in selector', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const selector = page.locator('#medicare-state-selector');
    const options = await selector.locator('option').allTextContents();

    expect(options).toContain('Puerto Rico');
    expect(options).toContain('Guam');
    expect(options).toContain('American Samoa');
    expect(options).toContain('Virgin Islands');
    expect(options).toContain('Northern Mariana Islands');
  });

  test('selecting Puerto Rico shows enrollment data', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const selector = page.locator('#medicare-state-selector');
    await selector.selectOption('Puerto Rico');
    await page.waitForTimeout(3000);

    // Should show some data or a territory-specific message
    const body = await page.textContent('body');
    expect(body).toContain('Puerto Rico');
  });

  test('territory map shows no-geometry message', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const selector = page.locator('#medicare-state-selector');
    await selector.selectOption('Guam');
    await page.waitForTimeout(2000);

    // Should show territory scope note
    const scopeNote = page.locator('text=Territory enrollment data is available');
    await expect(scopeNote).toBeVisible();
  });

  test('table includes all geographic areas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // The state enrollment table should include territories
    const table = page.locator('#all-areas-table');
    const text = await table.textContent();

    expect(text).toContain('Puerto Rico');
    expect(text).toContain('Guam');
  });
});
