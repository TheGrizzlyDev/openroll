import { describe, it, expect } from 'vitest'
import { generateCharacter } from '../src/morg_borg/generateCharacter'
import { classMap } from '../src/morg_borg/classes'

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
})
