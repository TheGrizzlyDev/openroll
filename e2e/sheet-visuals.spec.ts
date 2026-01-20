import { test, expect } from '@playwright/test'

const morkBorgStorageState = {
    state: {
        state: {
            characters: [
                {
                    id: 'argale',
                    name: 'Argale',
                    sheet: {
                        name: 'Argale',
                        class: 'Fanged Deserter',
                        str: 1,
                        agi: 0,
                        pre: -2,
                        tou: 2,
                        hp: 6,
                        maxHp: 6,
                        omens: 2,
                        scrolls: [],
                        equipment: [
                            { name: 'Zweihander', description: 'Heavy 2h', type: 'weapon' }
                        ]
                    },
                    inventory: [],
                    scrolls: []
                }
            ],
            lastAccess: { argale: 1 },
            log: []
        }
    },
    version: 0
}

test.describe('Mork Borg Character Sheet', () => {
    test('renders full sheet visuals', async ({ page }) => {
        // Seed with a character
        await page.addInitScript(storageState => {
            window.localStorage.setItem('openroll-store', JSON.stringify(storageState))
        }, morkBorgStorageState)

        // Navigate to the sheet
        await page.goto('/sheet/argale')

        // Verify key elements using SOFT assertions to ensure screenshot is taken even if selectors fail strict/partial checks
        await expect.soft(page.locator('h1', { hasText: 'DYING' })).toBeVisible()

        // Check for character name (Argale) 
        await expect.soft(page.locator('text=Argale').first()).toBeVisible()

        // Stats - Robust selection using class filtering
        await expect.soft(page.locator('.mork-stat-box').filter({ hasText: 'STRENGTH' })).toBeVisible()
        await expect.soft(page.locator('.mork-stat-box').filter({ hasText: 'AGILITY' })).toBeVisible()

        // HP & Omens
        await expect.soft(page.getByText('Hit Points', { exact: true })).toBeVisible()
        await expect.soft(page.getByText('Omens', { exact: true })).toBeVisible()

        // Capture screenshot to artifacts directory
        const artifactPath = '/home/antonio/.gemini/antigravity/brain/97c4cbd5-61db-47e2-a5fc-f8cee5aa72ab/mork_borg_sheet.png'
        await page.screenshot({ path: artifactPath, fullPage: true })
        test.info().attach('mork-borg-sheet', { path: artifactPath, contentType: 'image/png' })
    })
})
