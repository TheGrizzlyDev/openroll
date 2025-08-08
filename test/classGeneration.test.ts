import { describe, it, expect } from 'vitest'
import { generateCharacter } from '../src/mork_borg/generateCharacter'
import { classMap } from '../src/mork_borg/classes'

describe('class generation', () => {
  it('applies class data', () => {
    const className = 'Fanged Deserter'
    const { sheet, inventory } = generateCharacter(className)
    expect(sheet.class).toBe(className)
    const names = inventory.map(i => i.name)
    classMap[className].gear.forEach(item => {
      expect(names).toContain(item)
    })
  })

  it('includes default rations and waterskin', () => {
    const { inventory } = generateCharacter()
    const rations = inventory.find(i => i.name === 'Rations')
    const waterskin = inventory.find(i => i.name === 'Waterskin')
    expect(rations).toBeDefined()
    expect(waterskin).toBeDefined()
    expect(rations?.qty).toBeGreaterThanOrEqual(1)
    expect(rations?.qty).toBeLessThanOrEqual(4)
  })
})
