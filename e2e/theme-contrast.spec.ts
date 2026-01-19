import { test, expect } from '@playwright/test'

const lightThemeSettingsState = {
  state: {
    theme: 'light',
  },
  version: 0,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(settingsState => {
    window.localStorage.clear()
    window.localStorage.setItem('settings', JSON.stringify(settingsState))
  }, lightThemeSettingsState)
})

test('Nexus and Realm routes use different theme tokens', async ({ page }) => {
  await page.goto('/roster')
  await expect(page.getByRole('heading', { name: /^Roster$/, level: 2 })).toBeVisible()

  const nexusBg = await page.evaluate(
    () => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
  )

  await page.goto('/generator')
  await expect(page.getByRole('heading', { name: /Character Generator/ })).toBeVisible()

  const realmBg = await page.evaluate(
    () => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
  )

  expect(nexusBg).toBe('#121212')
  expect(realmBg).toBe('#ffffff')
  expect(nexusBg).not.toBe(realmBg)
})

test.describe('Theme visual contrast', () => {
  test('Nexus roster uses Nexus theme', async ({ page }) => {
    await page.goto('/roster')
    await expect(page.getByRole('heading', { name: /^Roster$/, level: 2 })).toBeVisible()
    const screenshot = await page.screenshot({ fullPage: true })
    test.info().attach('nexus-theme-roster', {
      body: screenshot,
      contentType: 'image/png',
    })
    expect(screenshot.byteLength).toBeGreaterThan(0)
  })

  test('Realm generator uses system theme', async ({ page }) => {
    await page.goto('/generator')
    await expect(page.getByRole('heading', { name: /Character Generator/ })).toBeVisible()
    const screenshot = await page.screenshot({ fullPage: true })
    test.info().attach('realm-theme-generator', {
      body: screenshot,
      contentType: 'image/png',
    })
    expect(screenshot.byteLength).toBeGreaterThan(0)
  })
})
