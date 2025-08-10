import { create } from 'zustand'

export interface DiceSet {
  id: string
  name: string
}

interface DiceSetStore {
  sets: DiceSet[]
  activeId: string | null
  setActive: (_id: string) => void
}

const defaultSets: DiceSet[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'fancy', name: 'Fancy' }
]

export const useDiceSetStore = create<DiceSetStore>(set => ({
  sets: defaultSets,
  activeId: defaultSets[0].id,
  setActive: id => set({ activeId: id })
}))
