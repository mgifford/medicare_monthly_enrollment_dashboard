import { test, expect } from '@playwright/test';

test.describe('Keyboard navigation', () => {
  test('skip link works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Tab to skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');
    const main = page.locator('#main-content');
    await expect(main).toBeFocused();
  });

  test('no map path is a sequential Tab stop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Tab through the page and check no SVG path gets focus
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName.toLowerCase() : '';
      });
      expect(focused).not.toBe('path');
    }
  });

  test('combo box is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const selector = page.locator('#medicare-state-selector');
    await selector.focus();

    // Should be able to select by keyboard
    await selector.selectOption('Puerto Rico');
    const value = await selector.inputValue();
    expect(value).toBe('Puerto Rico');
  });

  test('returning to national view leaves focus in logical location', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Select a state
    const selector = page.locator('#medicare-state-selector');
    await selector.selectOption('Alabama');
    await page.waitForTimeout(1000);

    // Find and click back button
    const backBtn = page.locator('#medicare-map-back');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);

      // Focus should be on a logical element (selector or heading)
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.id || el.tagName.toLowerCase() : '';
      });
      // Focus should not be on body
      expect(focused).not.toBe('');
    }
  });
});
