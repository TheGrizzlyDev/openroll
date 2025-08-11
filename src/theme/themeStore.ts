import { create } from 'zustand'
import type { ReactNode } from 'react'

export interface ThemeStyle {
  background: string
  backgroundAlt?: string
  text: { color: string }
  accent: string
  error: string
  font: { body: string }
  border?: { width?: string; radius?: string }
}

export interface Theme {
  id: string
  name: string
  style: ThemeStyle
  icons: Record<string, ReactNode>
}

interface ThemeState {
  themes: Theme[]
}

export const useThemeStore = create<ThemeState>(() => ({
  themes: [
    {
      id: 'default',
      name: 'Default',
      style: {
        background: '#fff',
        text: { color: '#000' },
        accent: '#000',
        error: '#f00',
        font: { body: 'sans-serif' }
      },
      icons: {}
    }
  ]
}))
