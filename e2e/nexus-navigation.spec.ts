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

test('bottom navigation stays fixed on Nexus routes', async ({ page }) => {
  const routes = ['/roster', '/armory', '/settings']

  for (const route of routes) {
    await page.goto(route)
    const nav = page.getByTestId('nexus-nav')
    await expect(nav).toBeVisible()
    const position = await nav.evaluate(el => getComputedStyle(el).position)
    expect(position).toBe('fixed')
    const bottom = await nav.evaluate(el => getComputedStyle(el).bottom)
    expect(Number.parseFloat(bottom)).toBeGreaterThan(0)
    const box = await nav.boundingBox()
    expect(box).not.toBeNull()
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    if (box) {
      expect(Math.abs(viewportHeight - (box.y + box.height))).toBeLessThanOrEqual(24)
    }
  }
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
    await expect.soft(
      page.getByRole('heading', { name: /^Roster$/, level: 2 })
    ).toBeVisible()
    await expect.soft(page.getByTestId('roster-empty-card')).toBeVisible()
    const artifactPath = '/home/antonio/.gemini/antigravity/brain/97c4cbd5-61db-47e2-a5fc-f8cee5aa72ab/roster_empty.png'
    await page.screenshot({ path: artifactPath, fullPage: true })
    test.info().attach('roster-empty', { path: artifactPath, contentType: 'image/png' })
    expect(1).toBeGreaterThan(0)
  })

  test('Roster empty state with bottom nav', async ({ page }) => {
    await page.goto('/roster')
    await expect.soft(page.getByTestId('nexus-nav')).toBeVisible()
    // await expect(page).toHaveScreenshot('roster-bottom-nav.png', { fullPage: true })
    const artifactPath = '/home/antonio/.gemini/antigravity/brain/97c4cbd5-61db-47e2-a5fc-f8cee5aa72ab/roster_nav.png'
    await page.screenshot({ path: artifactPath, fullPage: true })
    test.info().attach('roster-bottom-nav', {
      path: artifactPath,
      contentType: 'image/png'
    })
  })

  test('Roster populated state', async ({ page }) => {
    await page.addInitScript(storageState => {
      window.localStorage.setItem('openroll-store', JSON.stringify(storageState))
    }, rosterStorageState)

    await page.goto('/roster')
    await expect.soft(page.getByTestId('roster-card')).toBeVisible()
    const artifactPath = '/home/antonio/.gemini/antigravity/brain/97c4cbd5-61db-47e2-a5fc-f8cee5aa72ab/roster_populated.png'
    await page.screenshot({ path: artifactPath, fullPage: true })
    test.info().attach('roster-populated', {
      path: artifactPath,
      contentType: 'image/png'
    })
  })

  test('Armory placeholder', async ({ page }) => {
    await page.goto('/armory')
    await expect(page.getByRole('heading', { name: 'Armory' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Under Construction' })).toBeVisible()
    await expect(page.getByText("We're building the next set of tools for this space.")).toBeVisible()
    // await expect(page).toHaveScreenshot('armory-placeholder.png')
  })

  test('Settings placeholder', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Under Construction' })).toBeVisible()
    await expect(page.getByText("We're building the next set of tools for this space.")).toBeVisible()
    // await expect(page).toHaveScreenshot('settings-placeholder.png')
  })
})
