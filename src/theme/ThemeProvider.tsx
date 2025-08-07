/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'

interface ThemeContextValue {
  game: string
  icons: Record<string, ReactNode>
}

const ThemeContext = createContext<ThemeContextValue>({ game: 'default', icons: {} })

const iconsByGame: Record<string, Record<string, ReactNode>> = {
  default: { roll: '🎲', dice: '🎲', edit: '✎' },
  mork_borg: { roll: '☠️', dice: '☠️', edit: '✎' },
  ose: { roll: '⚔️', dice: '⚔️', edit: '✎' }
}

export function ThemeProvider({ game = 'default', children }: { game?: string; children: ReactNode }) {
  useEffect(() => {
    import('../themes/default.css')
    if (game && game !== 'default') {
      import(`../themes/${game}.css`)
    }
  }, [game])

  const value = useMemo(
    () => ({ game, icons: iconsByGame[game] || iconsByGame.default }),
    [game]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
