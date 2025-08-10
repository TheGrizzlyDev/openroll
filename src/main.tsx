/* eslint react-refresh/only-export-components: off */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './theme/ThemeProvider'
import { useSettingsStore } from './settingsStore'
import type { ReactNode } from 'react'

function RootThemeProvider({ children }: { children: ReactNode }) {
  const themeId = useSettingsStore(state => state.appThemeId)
  return <ThemeProvider themeId={themeId}>{children}</ThemeProvider>
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <RootThemeProvider>
        <App />
      </RootThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

registerSW()
