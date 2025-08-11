/* eslint react-refresh/only-export-components: off */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@radix-ui/themes/styles.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import AppThemeProvider from './AppThemeProvider'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

registerSW()

let scrollTimeout: ReturnType<typeof setTimeout> | null = null
window.addEventListener(
  'scroll',
  () => {
    document.body.classList.add('scrolling')
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      document.body.classList.remove('scrolling')
    }, 500)
  },
  { passive: true }
)
