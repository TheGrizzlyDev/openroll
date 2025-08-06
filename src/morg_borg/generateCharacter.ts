import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'
import { createSheet } from './sheet'
import { rollArmor, rollWeapon, rollGear, rollSilver } from './data/gear'
import { rollTrait, rollBackground } from './data/traits'
import { rollUncleanScroll, rollSacredScroll } from './data/scrolls'
import classNames, { classMap } from './classes'

export interface InventoryItem {
  id: number
  name: string
  qty: number
  notes: string
}

export interface Scroll {
  id: number
  type: 'unclean' | 'sacred'
  name: string
  casts: number
  notes: string
}

export interface GeneratedCharacter {
  sheet: ReturnType<typeof createSheet>
  inventory: InventoryItem[]
  scrolls: Scroll[]
}

const abilityScoreToModifier = (score: number): number => {
  if (score <= 4) return -3
  if (score <= 6) return -2
  if (score <= 8) return -1
  if (score <= 12) return 0
  if (score <= 14) return 1
  if (score <= 16) return 2
  return 3
}

export function generateCharacter(clsName?: string): GeneratedCharacter {
  const roller = new DiceRoller()

  const selectedClassName =
    clsName && classMap[clsName]
      ? clsName
      : classNames[Math.floor(Math.random() * classNames.length)]
  const classData = classMap[selectedClassName]

  const rollTotal = (notation: string): number => (roller.roll(notation) as DiceRoll).total as number

  const stats: Record<string, number> = {}
  ;['str', 'agi', 'pre', 'tou'].forEach(stat => {
    const score = rollTotal('3d6')
    stats[stat] = abilityScoreToModifier(score)
  })

  Object.entries(classData.stats).forEach(([stat, mod]) => {
    stats[stat] = (stats[stat] ?? 0) + (mod ?? 0)
  })

  const tgh = stats.tou
  let hp = rollTotal('1d8') + tgh
  if (hp < 1) hp = 1

  const omens = rollTotal('1d2')

  const armorResult = rollArmor()
  const weaponResult = rollWeapon()
  const gearResult = rollGear()
  const silver = rollSilver()
  const trait = rollTrait()
  const background = rollBackground()
  const sheet = createSheet()
  Object.assign(sheet, stats, {
    class: classData.name,
    hp,
    maxHp: hp,
    armor: armorResult.armor,
    omens,
    silver,
    trait,
    background,
    notes: classData.abilities.join('\n')
  })

  const baseId = Date.now()
  const rationsQty = rollTotal('1d4')
  const inventory = [
    { id: baseId, name: weaponResult.name, qty: 1, notes: weaponResult.notes },
    { id: baseId + 1, name: gearResult, qty: 1, notes: '' },
    { id: baseId + 2, name: 'Rations', qty: rationsQty, notes: '' },
    { id: baseId + 3, name: 'Waterskin', qty: 1, notes: '' }
  ]

  let nextId = baseId + inventory.length
  if (armorResult.armor > 0) {
    inventory.push({ id: nextId++, name: armorResult.name, qty: 1, notes: '' })
  }

  classData.gear.forEach(name => {
    inventory.push({ id: nextId++, name, qty: 1, notes: '' })
  })

  const scrolls: Scroll[] = []
  if (stats.pre >= 0) {
    const scrollType = rollTotal('1d2') === 1 ? 'unclean' : 'sacred'
    const scrollName =
      scrollType === 'unclean' ? rollUncleanScroll() : rollSacredScroll()
    const casts = rollTotal('1d4')
    scrolls.push({ id: nextId++, type: scrollType, name: scrollName, casts, notes: '' })
  }

  return { sheet, inventory, scrolls }
}

