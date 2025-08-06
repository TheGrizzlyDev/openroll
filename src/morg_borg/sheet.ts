export interface Sheet {
  name: string
  class: string
  str: number
  agi: number
  pre: number
  tou: number
  statDice: {
    str: string
    agi: string
    pre: string
    tou: string
  }
  hp: number
  maxHp: number
  armor: number
  omens: number
  silver: number
  trait: string
  background: string
  notes: string
  conditions: string[]
}

export const createSheet = (): Sheet => ({
  name: '',
  class: '',
  str: 0,
  agi: 0,
  pre: 0,
  tou: 0,
  statDice: {
    str: '1d20',
    agi: '1d20',
    pre: '1d20',
    tou: '1d20'
  },
  hp: 0,
  maxHp: 0,
  armor: 0,
  omens: 0,
  silver: 0,
  trait: '',
  background: '',
  notes: '',
  conditions: []
})
