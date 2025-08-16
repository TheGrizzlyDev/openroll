import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Die } from './diceStore'

export interface DiceSet {
  id: string
  name: string
  dice: Die[]
  updatedAt: number
  active: boolean
}

interface DiceSetStore {
  sets: DiceSet[]
  createSet: (_name: string, _dice?: Die[]) => void
  updateSet: (_id: string, _data: Partial<Omit<DiceSet, 'id' | 'updatedAt'>>) => void
  deleteSet: (_id: string) => void
  activateSet: (_id: string) => void
}

const defaultSets: DiceSet[] = [
  {
    id: 'classic',
    name: 'Classic',
    dice: [],
    updatedAt: Date.now(),
    active: true
  },
  {
    id: 'fancy',
    name: 'Fancy',
    dice: [],
    updatedAt: Date.now() - 1,
    active: false
  }
]

export const useDiceSetStore = create<DiceSetStore>()(
  persist(
    set => ({
      sets: defaultSets,
      createSet: (name, dice = []) =>
        set(state => ({
          sets: [
            ...state.sets,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              name,
              dice,
              updatedAt: Date.now(),
              active: false
            }
          ]
        })),
      updateSet: (id, data) =>
        set(state => ({
          sets: state.sets.map(setItem =>
            setItem.id === id
              ? { ...setItem, ...data, updatedAt: Date.now() }
              : setItem
          )
        })),
      deleteSet: id =>
        set(state => {
          const remaining = state.sets.filter(s => s.id !== id)
          const anyActive = remaining.some(s => s.active)
          const newSets = anyActive
            ? remaining
            : remaining.map((s, idx) => ({ ...s, active: idx === 0 }))
          return { sets: newSets }
        }),
      activateSet: id =>
        set(state => ({
          sets: state.sets.map(s =>
            s.id === id
              ? { ...s, active: true, updatedAt: Date.now() }
              : { ...s, active: false }
          )
        }))
    }),
    { name: 'dice-sets' }
  )
)
