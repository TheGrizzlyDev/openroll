import { create } from 'zustand'

export interface TraySet {
  id: string
  name: string
}

interface TraySetStore {
  sets: TraySet[]
  activeId: string | null
  setActive: (_id: string | null) => void
}

const defaultSets: TraySet[] = [
  { id: 'wood', name: 'Wood' },
  { id: 'stone', name: 'Stone' }
]

export const useTraySetStore = create<TraySetStore>(set => ({
  sets: defaultSets,
  activeId: null,
  setActive: id => set({ activeId: id })
}))
