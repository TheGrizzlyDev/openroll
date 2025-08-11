/* eslint react-refresh/only-export-components: off */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@radix-ui/themes/styles.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { Theme } from '@radix-ui/themes'
import { applyTheme } from './theme'

applyTheme()

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <Theme appearance="dark" accentColor="purple">
        <App />
      </Theme>
    </BrowserRouter>
  </StrictMode>,
)

registerSW()
