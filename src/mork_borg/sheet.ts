export interface Sheet {
  name: string
  class: string
  str: number
  agi: number
  pre: number
  tou: number
  hp: number
  tempHp: number
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
  hp: 0,
  tempHp: 0,
  maxHp: 0,
  armor: 0,
  omens: 0,
  silver: 0,
  trait: '',
  background: '',
  notes: '',
  conditions: []
})
