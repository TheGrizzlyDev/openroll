import { ReactNode, useEffect, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { useSettingsStore } from './stores/settingsStore'
import { applyTheme } from './theme'
import { useLocation } from 'react-router-dom'

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSettingsStore(state => state.theme)
  const location = useLocation()
  const isNexusRoute = ['/roster', '/armory', '/settings'].some(route =>
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  )
  const [appearance, setAppearance] = useState<'dark'>(() => 'dark')

  useEffect(() => {
    if (isNexusRoute) {
      setAppearance('dark')
      return
    }

    if (mode === 'auto') {
      setAppearance('dark')
    } else {
      setAppearance(mode as 'dark')
    }
  }, [mode, isNexusRoute])

  useEffect(() => {
    applyTheme(isNexusRoute ? 'nexus' : appearance)
  }, [appearance, isNexusRoute])

  return (
    <Theme appearance={appearance} accentColor="purple">
      {children}
    </Theme>
  )
}
