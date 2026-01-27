import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'
import { equipment } from './morkBorgData'

export interface ArmorEntry {
  name: string
  armor: number
  properties: string
  cost: string
}

export interface WeaponEntry {
  name: string
  damage: string
  notes?: string
}

export interface GearEntry {
  name: string
  cost: string
  notes?: string
}

// Convert extracted data to the expected format
export const armor: ArmorEntry[] = equipment.armor.map(item => ({
  name: item.name,
  armor: parseInt(item.roll) - 1, // Convert roll 1-4 to armor 0-3
  properties: item.properties,
  cost: item.properties.includes('s') ? item.properties.match(/(\d+s)/)?.[1] || 'Unknown' : 'Unknown'
}))

export const weapons: WeaponEntry[] = equipment.weapons.map(item => ({
  name: item.name,
  damage: item.damage,
  notes: item.notes || `[dice "${item.damage}" ${item.damage}] damage`
}))

export const gear: GearEntry[] = equipment.gear.map(item => ({
  name: item.name,
  cost: item.cost,
  notes: item.notes || ''
}))

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

// Export the raw data for direct access
export { equipment }

