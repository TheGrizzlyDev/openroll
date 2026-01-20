import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
  })
})

test('realm back arrow returns to roster from generator', async ({ page }) => {
  await page.goto('/generator')
  await expect(page.getByRole('heading', { name: /Character Generator/ })).toBeVisible()

  await page.getByRole('button', { name: 'Back to roster' }).click()
  await expect(page).toHaveURL(/\/roster$/)
  await expect(page.getByRole('heading', { name: 'Roster', level: 2 })).toBeVisible()
})

test('realm back arrow returns to roster from sheet', async ({ page }) => {
  await page.goto('/generator')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page).toHaveURL(/\/sheet\/\d+$/)

  await page.getByRole('button', { name: 'Back to roster' }).click()
  await expect(page).toHaveURL(/\/roster$/)
})

test.describe('Realm visual states', () => {
  test('Generator view', async ({ page }) => {
    await page.goto('/generator')
    await expect(page.getByRole('heading', { name: /Character Generator/ })).toBeVisible()
    await expect(page).toHaveScreenshot('realm-generator.png')
  })

  test('Character sheet view', async ({ page }) => {
    await page.goto('/generator')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page).toHaveURL(/\/sheet\/\d+$/)
    await expect(page).toHaveScreenshot('realm-sheet.png')
  })
})
