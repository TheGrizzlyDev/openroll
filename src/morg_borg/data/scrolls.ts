import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'

export interface ScrollData {
  name: string
  notes: string
}

export const uncleanScrolls: ScrollData[] = [
  {
    name: "Banshee's Howl",
    notes: 'Deal [dice 1d6] damage to all nearby enemies.'
  },
  { name: 'Black Bolt', notes: 'Launch a bolt for [dice 1d8] damage.' },
  { name: 'Decompose', notes: "Target's armor takes [dice 1d4] damage." },
  { name: 'Evil Eye', notes: 'Curse target with a [dice 1d4] penalty.' },
  { name: 'Foul Fluid', notes: 'Spray acid for [dice 1d6] damage.' },
  {
    name: 'Grasp of the Dead',
    notes: 'Skeletal hands deal [dice 1d4] damage.'
  },
  { name: 'Hellfire', notes: 'Engulf a foe in flame for [dice 1d10] damage.' },
  { name: 'Lightning Blast', notes: 'Strike with lightning for [dice 1d8] damage.' },
  { name: 'Pestilent Wind', notes: 'Poisonous gust deals [dice 1d4] damage.' },
  { name: 'Rotting Touch', notes: 'Touch rots flesh for [dice 1d6] damage.' },
  {
    name: "Serpent's Dance",
    notes: 'Summon snakes, each dealing [dice 1d4].'
  },
  { name: 'Spectral Steed', notes: 'Summon mount lasting [dice 1d6] hours.' },
  { name: 'Tongue of Eris', notes: 'Cause discord for [dice 1d4] rounds.' },
  { name: 'Void Tentacles', notes: 'Dark tendrils deal [dice 1d6] damage.' }
]

export const sacredScrolls: ScrollData[] = [
  { name: 'Banish', notes: 'Banish spirit with [dice 1d6] power.' },
  { name: 'Bless', notes: 'Ally gains +[dice 1d4] bonus.' },
  { name: 'Grace of a Dead Saint', notes: 'Heal [dice 1d8] HP.' },
  {
    name: 'Holy Light',
    notes: 'Radiant blast deals [dice 1d6] damage to undead.'
  },
  { name: 'Lay on Hands', notes: 'Restore [dice 1d6] HP.' },
  { name: 'Miraculous Cure', notes: 'Remove ailment and heal [dice 1d8].' },
  {
    name: 'Prayer of Protection',
    notes: 'Gain [dice 1d4] armor for one hour.'
  },
  { name: 'Purify', notes: 'Cleanse poison, restoring [dice 1d4] HP.' },
  { name: 'Revelation', notes: 'Divine insight for [dice 1d4] questions.' },
  { name: 'Sanctuary', notes: 'Barrier absorbs [dice 1d6] damage.' }
]

const roller = new DiceRoller()

export const rollUncleanScroll = (): ScrollData => {
  const roll = (roller.roll(`1d${uncleanScrolls.length}`) as DiceRoll).total as number
  return uncleanScrolls[roll - 1]
}

export const rollSacredScroll = (): ScrollData => {
  const roll = (roller.roll(`1d${sacredScrolls.length}`) as DiceRoll).total as number
  return sacredScrolls[roll - 1]
}

