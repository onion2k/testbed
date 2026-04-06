import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'Testbed' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Shop' })).toBeVisible()
})
