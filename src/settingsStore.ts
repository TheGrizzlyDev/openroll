import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NavPosition = 'left' | 'right' | 'top' | 'bottom'

interface SettingsState {
  navPosition: NavPosition
  setNavPosition: (_pos: NavPosition) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      navPosition: 'bottom',
      setNavPosition: navPosition => set({ navPosition }),
    }),
    { name: 'settings' }
  )
)
