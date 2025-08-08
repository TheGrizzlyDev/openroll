import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './theme/ThemeProvider'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <ThemeProvider game="default">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

registerSW()
