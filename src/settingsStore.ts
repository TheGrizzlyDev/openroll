import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NavPosition = 'left' | 'right' | 'top' | 'bottom'

interface SettingsState {
  navPosition: NavPosition
  setNavPosition: (_pos: NavPosition) => void
  themeId: string
  setThemeId: (_id: string) => void
  appThemeId: string
  setAppThemeId: (_id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      navPosition: 'bottom',
      setNavPosition: navPosition => set({ navPosition }),
      themeId: 'default',
      setThemeId: themeId => set({ themeId }),
      appThemeId: 'default',
      setAppThemeId: appThemeId => set({ appThemeId })
    }),
    { name: 'settings' }
  )
)
