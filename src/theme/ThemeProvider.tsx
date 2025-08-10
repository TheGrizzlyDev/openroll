/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useThemeStore, type ThemeStyle } from './themeStore'

interface ThemeContextValue {
  themeId: string
  icons: Record<string, ReactNode>
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'default',
  icons: {},
})

export function ThemeProvider({ themeId = 'default', children }: { themeId?: string; children: ReactNode }) {
  const theme = useThemeStore(
    state => state.themes.find(t => t.id === themeId) || state.themes.find(t => t.id === 'default')!
  )
  const defaultTheme = useThemeStore.getState().themes.find(t => t.id === 'default')!

  useEffect(() => {
    const root = document.documentElement
    const applyStyle = (style: ThemeStyle) => {
      root.style.setProperty('--color-bg', style.background)
      if (style.backgroundAlt)
        root.style.setProperty('--color-bg-alt', style.backgroundAlt)
      root.style.setProperty('--color-text', style.text.color)
      root.style.setProperty('--color-accent', style.accent)
      root.style.setProperty('--color-error', style.error)
      root.style.setProperty('--font-body', style.font.body)
      if (style.border?.width) root.style.setProperty('--border-width', style.border.width)
      if (style.border?.radius) root.style.setProperty('--border-radius', style.border.radius)
    }
    applyStyle(defaultTheme.style)
    applyStyle(theme.style)
  }, [theme, defaultTheme])

  const value = useMemo(() => ({ themeId: theme.id, icons: theme.icons }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
