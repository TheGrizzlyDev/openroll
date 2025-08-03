import { DiceRoller, type DiceRoll } from '@dice-roller/rpg-dice-roller'

export const physicalTraits = [
  'Skull-like face',
  'Sunken eyes',
  'Scarred body',
  'Hunched back',
  'Missing fingers',
  'Gaunt frame',
  'Tattooed skin',
  'Piercing gaze',
  'Wild hair',
  'Burned visage',
  'Pale complexion',
  'One-eyed',
  'Trembling hands',
  'Broken nose',
  'Metal teeth',
  'Long nails',
  'Brand marks',
  'Twisted spine',
  'Ritual scars',
  'Runic birthmark'
]

export const backgrounds = [
  'Escaped cultist',
  'Failed farmer',
  'Grave robber',
  'Disgraced noble',
  'Village preacher',
  'Runaway slave',
  'Battlefield scavenger',
  'Plague doctor',
  'Charlatan',
  'Gambler',
  'Fallen templar',
  'Wandering minstrel',
  'Alchemist\'s apprentice',
  'Sewer dweller',
  'Pirate',
  'Jailed outlaw',
  'Mad prophet',
  'Drunken sailor',
  'Witch\'s ward',
  'Tomb raider'
]

export const miseries = [
  'A star falls, leaving a smoking crater',
  'The sky turns crimson for a day',
  'Famine grips the land',
  'Plague spreads among cattle',
  'Ghosts haunt the roads',
  'Rivers dry up',
  'Relentless rain floods the valleys',
  'A false prophet rises',
  'The dead walk the fields',
  'A mighty king dies without heir',
  'Forest fires rage uncontrolled',
  'The moon is swallowed',
  'A demon cult gains power',
  'Earthquakes shatter cities',
  'A tyrant crowns himself emperor',
  'The ocean boils',
  'Darkness covers the sun',
  'Monstrous beasts stalk villages',
  'All wells turn to blood',
  'The world ends in screams'
]

const roller = new DiceRoller()

export const rollTrait = () => {
  const roll = (roller.roll('1d20') as DiceRoll).total as number
  return physicalTraits[roll - 1]
}

export const rollBackground = () => {
  const roll = (roller.roll('1d20') as DiceRoll).total as number
  return backgrounds[roll - 1]
}

export const rollMisery = () => {
  const roll = (roller.roll('1d20') as DiceRoll).total as number
  return miseries[roll - 1]
}

