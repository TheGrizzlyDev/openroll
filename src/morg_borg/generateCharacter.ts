import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'
import { createSheet } from './sheet'

export interface InventoryItem {
  id: number
  name: string
  qty: number
  notes: string
}

export interface GeneratedCharacter {
  sheet: ReturnType<typeof createSheet>
  inventory: InventoryItem[]
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

const armorTable = [
  { name: 'No armor', armor: 0 },
  { name: 'Light armor', armor: 1 },
  { name: 'Medium armor', armor: 2 },
  { name: 'Heavy armor', armor: 3 }
]

const weaponTable = [
  { name: 'Staff', notes: '1d4 damage' },
  { name: 'Dagger', notes: '1d4 damage' },
  { name: 'Club', notes: '1d4 damage' },
  { name: 'Sword', notes: '1d6 damage' },
  { name: 'Axe', notes: '1d6 damage' },
  { name: 'Mace', notes: '1d6 damage' },
  { name: 'Flail', notes: '1d8 damage' },
  { name: 'Polearm', notes: '1d8 damage' },
  { name: 'Bow', notes: '1d6 damage' },
  { name: 'Crossbow', notes: '1d8 damage' }
]

const gearTable = [
  'Backpack',
  'Caltrops',
  'Chain (10ft)',
  'Crowbar',
  'Grappling hook',
  'Lantern & oil',
  'Lockpicks',
  'Mirror',
  'Rations (d4 days)',
  'Rope (30ft)',
  'Shovel',
  'Torch'
]

export function generateCharacter(): GeneratedCharacter {
  const roller = new DiceRoller()

  const rollTotal = (notation: string): number => (roller.roll(notation) as DiceRoll).total as number

  const stats: Record<string, number> = {}
  ;['str', 'agi', 'pre', 'tou'].forEach(stat => {
    const score = rollTotal('3d6')
    stats[stat] = abilityScoreToModifier(score)
  })

  const tgh = stats.tou
  let hp = rollTotal('1d8') + tgh
  if (hp < 1) hp = 1

  const omens = rollTotal('1d2')

  const armorRoll = rollTotal('1d4')
  const armorResult = armorTable[armorRoll - 1]

  const weaponRoll = rollTotal('1d10')
  const weaponResult = weaponTable[weaponRoll - 1]

  const gearRoll = rollTotal('1d12')
  const gearResult = gearTable[gearRoll - 1]

  const silver = rollTotal('2d6') * 10

  const sheet = {
    ...createSheet(),
    ...stats,
    hp,
    maxHp: hp,
    armor: armorResult.armor,
    omens,
    silver
  }

  const inventory = [
    { id: Date.now(), name: weaponResult.name, qty: 1, notes: weaponResult.notes },
    { id: Date.now() + 1, name: gearResult, qty: 1, notes: '' }
  ]

  if (armorResult.armor > 0) {
    inventory.push({ id: Date.now() + 2, name: armorResult.name, qty: 1, notes: '' })
  }

  return { sheet, inventory }
}

