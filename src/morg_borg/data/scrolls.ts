import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'

export const uncleanScrolls = [
  'Banshee\'s Howl',
  'Black Bolt',
  'Decompose',
  'Evil Eye',
  'Foul Fluid',
  'Grasp of the Dead',
  'Hellfire',
  'Lightning Blast',
  'Pestilent Wind',
  'Rotting Touch',
  'Serpent\'s Dance',
  'Spectral Steed',
  'Tongue of Eris',
  'Void Tentacles'
]

export const sacredScrolls = [
  'Banish',
  'Bless',
  'Grace of a Dead Saint',
  'Holy Light',
  'Lay on Hands',
  'Miraculous Cure',
  'Prayer of Protection',
  'Purify',
  'Revelation',
  'Sanctuary'
]

const roller = new DiceRoller()

export const rollUncleanScroll = () => {
  const roll = (roller.roll(`1d${uncleanScrolls.length}`) as DiceRoll).total as number
  return uncleanScrolls[roll - 1]
}

export const rollSacredScroll = () => {
  const roll = (roller.roll(`1d${sacredScrolls.length}`) as DiceRoll).total as number
  return sacredScrolls[roll - 1]
}

