import { create } from 'zustand'

export interface TraySet {
  id: string
  name: string
  config: Record<string, unknown>
  updatedAt: number
  active: boolean
}

interface TraySetStore {
  sets: TraySet[]
  setActive: (_id: string | null) => void
  upsert: (_set: Omit<TraySet, 'updatedAt' | 'active'> & { updatedAt?: number }) => void
  remove: (_id: string) => void
}

const defaultSets: TraySet[] = [
  { id: 'wood', name: 'Wood', config: {}, updatedAt: Date.now(), active: false },
  { id: 'stone', name: 'Stone', config: {}, updatedAt: Date.now(), active: false }
]

export const useTraySetStore = create<TraySetStore>(set => ({
  sets: defaultSets,
  setActive: id =>
    set(state => ({
      sets: state.sets.map(s => ({ ...s, active: s.id === id }))
    })),
  upsert: setInfo =>
    set(state => {
      const existingIndex = state.sets.findIndex(s => s.id === setInfo.id)
      const updatedSet: TraySet = {
        ...setInfo,
        updatedAt: setInfo.updatedAt ?? Date.now(),
        active: existingIndex >= 0 ? state.sets[existingIndex].active : false
      }
      if (existingIndex >= 0) {
        const sets = [...state.sets]
        sets[existingIndex] = updatedSet
        return { sets }
      }
      return { sets: [...state.sets, updatedSet] }
    }),
  remove: id => set(state => ({ sets: state.sets.filter(s => s.id !== id) }))
}))

