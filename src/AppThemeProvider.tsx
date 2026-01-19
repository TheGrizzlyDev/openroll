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
  const [appearance, setAppearance] = useState<'light' | 'dark'>(() =>
    isNexusRoute ? 'dark' : 'light'
  )

  useEffect(() => {
    if (isNexusRoute) {
      setAppearance('dark')
      return
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handle = () => setAppearance(mq.matches ? 'dark' : 'light')
    if (mode === 'auto') {
      handle()
      mq.addEventListener('change', handle)
      return () => mq.removeEventListener('change', handle)
    }
    setAppearance(mode)
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
