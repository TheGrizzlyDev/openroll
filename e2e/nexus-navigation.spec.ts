import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
  })
})

const rosterStorageState = {
  state: {
    state: {
      characters: [
        {
          id: 'rhea',
          name: 'Rhea',
          sheet: {
            name: 'Rhea',
            class: 'Wretch',
            str: 1,
            agi: 0,
            pre: -1,
            tou: 2,
            hp: 4,
            tempHp: 0,
            maxHp: 7,
            armor: 1,
            omens: 2,
            silver: 40,
            trait: '',
            background: '',
            notes: '',
            conditions: []
          },
          inventory: [],
          scrolls: []
        }
      ],
      lastAccess: { rhea: 5 },
      log: []
    }
  },
  version: 0
}

test('bottom navigation swaps between Nexus destinations', async ({ page }) => {
  await page.goto('/roster')
  await expect(
    page.getByRole('heading', { name: /^Roster$/, level: 2 })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Armory' }).click()
  await expect(page).toHaveURL(/\/armory$/)
  await expect(page.getByRole('heading', { name: 'Armory' })).toBeVisible()

  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  await page.getByRole('button', { name: 'Roster' }).click()
  await expect(page).toHaveURL(/\/roster$/)
  await expect(
    page.getByRole('heading', { name: /^Roster$/, level: 2 })
  ).toBeVisible()
})

test('empty roster CTA navigates to generator flow', async ({ page }) => {
  await page.goto('/roster')
  await expect(page.getByTestId('roster-empty-card')).toBeVisible()

  await page.getByRole('button', { name: 'Select a System' }).click()
  await expect(page).toHaveURL(/\/generator$/)
})

test('populated roster renders cards with key elements', async ({ page }) => {
  await page.addInitScript(storageState => {
    window.localStorage.setItem('openroll-store', JSON.stringify(storageState))
  }, rosterStorageState)

  await page.goto('/roster')
  await expect(page.getByTestId('roster-card')).toBeVisible()
  await expect(page.getByTestId('roster-system-tag')).toHaveText(/Mörk Borg/)
  await expect(page.getByTestId('roster-class-tag')).toHaveText(/Wretch/)
  await expect(page.getByTestId('roster-stat-hp')).toHaveText(/4\/7/)
})

test.describe('Nexus visual states', () => {
  test('Roster empty state', async ({ page }) => {
    await page.goto('/roster')
    await expect(
      page.getByRole('heading', { name: /^Roster$/, level: 2 })
    ).toBeVisible()
    await expect(page.getByTestId('roster-empty-card')).toBeVisible()
    const screenshot = await page.screenshot({ fullPage: true })
    test.info().attach('roster-empty', { body: screenshot, contentType: 'image/png' })
    expect(screenshot.byteLength).toBeGreaterThan(0)
  })

  test('Roster populated state', async ({ page }) => {
    await page.addInitScript(storageState => {
      window.localStorage.setItem('openroll-store', JSON.stringify(storageState))
    }, rosterStorageState)

    await page.goto('/roster')
    await expect(page.getByTestId('roster-card')).toBeVisible()
    const screenshot = await page.screenshot({ fullPage: true })
    test.info().attach('roster-populated', {
      body: screenshot,
      contentType: 'image/png'
    })
    expect(screenshot.byteLength).toBeGreaterThan(0)
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
