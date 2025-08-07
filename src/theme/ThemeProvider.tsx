/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useGameContext, type DiceStyle } from '../GameContext'

interface ThemeContextValue {
  game: string
  icons: Record<string, ReactNode>
  diceStyle: DiceStyle
}

const ThemeContext = createContext<ThemeContextValue>({
  game: 'default',
  icons: {},
  diceStyle: { color: '#ffffff', edgeColor: '#000000', textureUrls: [] }
})

const iconsByGame: Record<string, Record<string, ReactNode>> = {
  default: { roll: '🎲', dice: '🎲', edit: '✎' },
  mork_borg: { roll: '☠️', dice: '☠️', edit: '✎' },
  ose: { roll: '⚔️', dice: '⚔️', edit: '✎' }
}

export function ThemeProvider({ game = 'default', children }: { game?: string; children: ReactNode }) {
  const diceStyle = useGameContext(state => state.state.diceStyle)
  useEffect(() => {
    import('../themes/default.css')
    if (game && game !== 'default') {
      import(`../themes/${game}.css`)
    }
  }, [game])

  const value = useMemo(
    () => ({ game, icons: iconsByGame[game] || iconsByGame.default, diceStyle }),
    [game, diceStyle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
