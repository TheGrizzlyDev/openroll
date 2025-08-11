import { ReactNode, useEffect, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { useSettingsStore } from './settingsStore'
import { applyTheme } from './theme'

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSettingsStore(state => state.theme)
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handle = () => setAppearance(mq.matches ? 'dark' : 'light')
    if (mode === 'auto') {
      handle()
      mq.addEventListener('change', handle)
      return () => mq.removeEventListener('change', handle)
    } else {
      setAppearance(mode)
    }
  }, [mode])

  useEffect(() => {
    applyTheme(appearance)
  }, [appearance])

  return (
    <Theme appearance={appearance} accentColor="purple">
      {children}
    </Theme>
  )
}
