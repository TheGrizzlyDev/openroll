import { create } from 'zustand'

export type StartTab = 'characters' | 'dices' | 'trays' | 'settings'

interface StartPageState {
  activeTab: StartTab
  setActiveTab: (_tab: StartTab) => void
}

export const useStartPageStore = create<StartPageState>(set => ({
  activeTab: 'characters',
  setActiveTab: activeTab => set({ activeTab })
}))

