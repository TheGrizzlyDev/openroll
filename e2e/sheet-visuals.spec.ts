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

        // Check for character name (Argale) 
        await expect.soft(page.locator('input[placeholder="NAME"]')).toHaveValue('Argale')

        // Stats - Checks for Strength and Agility in the new layout
        await expect.soft(page.getByText('Strength', { exact: true })).toBeVisible()
        await expect.soft(page.getByText('Agility', { exact: true })).toBeVisible()

        // Vitality & Omens
        await expect.soft(page.getByText('Vitality', { exact: true })).toBeVisible()
        await expect.soft(page.getByText('Omens', { exact: true })).toBeVisible()

        // Check for DICE button
        await expect.soft(page.locator('button', { hasText: 'DICE' })).toBeVisible()

        // Capture screenshot to artifacts directory
        const artifactPath = '/home/antonio/.gemini/antigravity/brain/4005949a-f458-4c05-912f-1e28de59f2c3/mork_borg_sheet_new.png'
        await page.screenshot({ path: artifactPath, fullPage: true })
        test.info().attach('mork-borg-sheet', { path: artifactPath, contentType: 'image/png' })
    })
})
