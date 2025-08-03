import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'

export interface ArmorEntry {
  name: string
  armor: number
}

export interface WeaponEntry {
  name: string
  notes: string
}

export const armor: ArmorEntry[] = [
  { name: 'No armor', armor: 0 },
  { name: 'Light armor', armor: 1 },
  { name: 'Medium armor', armor: 2 },
  { name: 'Heavy armor', armor: 3 }
]

export const weapons: WeaponEntry[] = [
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

export const gear = [
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

export const silver = Array.from({ length: 11 }, (_, i) => (i + 2) * 10)

const roller = new DiceRoller()

export const rollArmor = () => {
  const roll = (roller.roll('1d4') as DiceRoll).total as number
  return armor[roll - 1]
}

export const rollWeapon = () => {
  const roll = (roller.roll('1d10') as DiceRoll).total as number
  return weapons[roll - 1]
}

export const rollGear = () => {
  const roll = (roller.roll('1d12') as DiceRoll).total as number
  return gear[roll - 1]
}

export const rollSilver = () => {
  const roll = (roller.roll('2d6') as DiceRoll).total as number
  return silver[roll - 2]
}

