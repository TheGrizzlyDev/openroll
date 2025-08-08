import { create } from 'zustand'
import type { DiceType } from './GameContext'

export interface Die {
  id: string
  name: string
  type: DiceType
}

interface DiceStore {
  dice: Die[]
  addDie: () => void
  updateDie: (_id: string, _data: Partial<Die>) => void
  removeDie: (_id: string) => void
}

export const useDiceStore = create<DiceStore>(set => ({
  dice: [],
  addDie: () =>
    set(state => ({
      dice: [
        ...state.dice,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: `Die ${state.dice.length + 1}`,
          type: 'd6'
        }
      ]
    })),
  updateDie: (id, data) =>
    set(state => ({
      dice: state.dice.map(die => (die.id === id ? { ...die, ...data } : die))
    })),
  removeDie: id =>
    set(state => ({
      dice: state.dice.filter(die => die.id !== id)
    }))
}))
