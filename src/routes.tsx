import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Navbar from './components/Navbar'
import { useSettingsStore } from './stores/settingsStore'

const StartPage = lazy(() => import('./components/StartPage'))
const SheetPage = lazy(() => import('./components/SheetPage'))
const LogView = lazy(() => import('./components/LogView'))
const CharacterGenerator = lazy(() => import('./mork_borg/components/CharacterGenerator'))
const DiceDemo = lazy(() => import('./components/DiceDemo'))

export default function AppRoutes() {
  const navPosition = useSettingsStore(state => state.navPosition)
  const location = useLocation()
  const isNexusRoute = ['/roster', '/armory', '/settings'].some(route =>
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  )
  const offsetClass = {
    top: 'mt-16',
    bottom: '',
    left: 'ml-24',
    right: 'mr-24'
  }[navPosition]
  const contentOffsetClass = isNexusRoute ? offsetClass : ''

  useEffect(() => {
    if (!isNexusRoute) {
      document.documentElement.style.setProperty('--navbar-footprint', '0px')
      document.documentElement.style.setProperty('--navbar-padding-bottom', '0px')
    }
  }, [isNexusRoute])

  return (
    <>
      {isNexusRoute && <Navbar />}
      <div className={contentOffsetClass}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/roster" replace />} />
            <Route path="/roster" element={<StartPage />} />
            <Route path="/armory" element={<StartPage />} />
            <Route path="/settings" element={<StartPage />} />
            <Route path="/generator" element={<CharacterGenerator />} />
            <Route path="/sheet/:id" element={<SheetPage />} />
            <Route path="/log" element={<LogView />} />
            <Route path="/dice-demo" element={<DiceDemo />} />
            <Route path="*" element={<Navigate to="/roster" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  )
}
