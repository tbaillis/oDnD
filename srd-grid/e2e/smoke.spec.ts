import { test, expect } from '@playwright/test'

test('app loads and shows controls', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page.locator('#game-root')).toBeVisible()
  await expect(page.locator('#controls')).toBeVisible()
  await page.click('#attack-mode')
  await expect(page.locator('#attack-mode')).toBeVisible()
})
