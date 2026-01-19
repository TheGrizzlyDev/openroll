import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
  })
})

test('bottom navigation swaps between Nexus destinations', async ({ page }) => {
  await page.goto('/roster')
  await expect(page.getByRole('heading', { name: 'Roster' })).toBeVisible()

  await page.getByRole('button', { name: 'Armory' }).click()
  await expect(page).toHaveURL(/\/armory$/)
  await expect(page.getByRole('heading', { name: 'Armory' })).toBeVisible()

  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  await page.getByRole('button', { name: 'Roster' }).click()
  await expect(page).toHaveURL(/\/roster$/)
  await expect(page.getByRole('heading', { name: 'Roster' })).toBeVisible()
})

test.describe('Nexus visual states', () => {
  test('Roster empty state', async ({ page }) => {
    await page.goto('/roster')
    await expect(page.getByRole('heading', { name: 'Roster' })).toBeVisible()
    await expect(page.getByText('No characters yet. Create a new one to get started.')).toBeVisible()
    await expect(page).toHaveScreenshot('roster-empty.png')
  })

  test('Armory placeholder', async ({ page }) => {
    await page.goto('/armory')
    await expect(page.getByRole('heading', { name: 'Armory' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Under Construction' })).toBeVisible()
    await expect(page.getByText("We're building the next set of tools for this space.")).toBeVisible()
    await expect(page).toHaveScreenshot('armory-placeholder.png')
  })

  test('Settings placeholder', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Under Construction' })).toBeVisible()
    await expect(page.getByText("We're building the next set of tools for this space.")).toBeVisible()
    await expect(page).toHaveScreenshot('settings-placeholder.png')
  })
})
