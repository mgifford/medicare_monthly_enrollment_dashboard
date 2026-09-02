import { test, expect } from '@playwright/test';
import { voiceOverTest } from '@guidepup/playwright';

voiceOverTest.describe('VoiceOver screen reader tests', () => {
  voiceOverTest('can navigate dashboard heading', async ({ page, voiceOver }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await voiceOver.navigateToWebContent();

    await voiceOver.nextHeading();
    const heading = await voiceOver.lastSpokenPhrase();
    expect(heading.toLowerCase()).toContain('medicare');
  });

  voiceOverTest('can find and use geographic selector', async ({ page, voiceOver }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await voiceOver.navigateToWebContent();

    const comboBox = page.locator('#medicare-state-selector');
    await comboBox.focus();

    const announcement = await voiceOver.lastSpokenPhrase();
    expect(announcement.toLowerCase()).toContain('state');
  });

  voiceOverTest('can select Puerto Rico without map', async ({ page, voiceOver }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.locator('#medicare-state-selector').selectOption('Puerto Rico');
    await page.waitForTimeout(2000);

    const body = await page.textContent('body');
    expect(body).toContain('Puerto Rico');
  });

  voiceOverTest('enrollment table is accessible', async ({ page, voiceOver }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await voiceOver.navigateToWebContent();

    const table = page.locator('table.data');
    await expect(table).toBeVisible();

    const caption = page.locator('table.data caption');
    const captionText = await caption.textContent();
    expect(captionText).toBeTruthy();
  });

  voiceOverTest('skip link targets main content', async ({ page, voiceOver }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await voiceOver.navigateToWebContent();

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  voiceOverTest('dashboard type toggle is accessible', async ({ page, voiceOver }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await voiceOver.navigateToWebContent();

    const group = page.locator('[role="group"][aria-label="Choose enrollment dashboard type"]');
    await expect(group).toBeAttached();

    const buttons = page.locator('.dashboard-type-button');
    const count = await buttons.count();
    expect(count).toBe(2);
  });
});
