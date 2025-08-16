import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import { useSettingsStore } from './stores/settingsStore'

const StartPage = lazy(() => import('./components/StartPage'))
const SheetPage = lazy(() => import('./components/SheetPage'))
const LogView = lazy(() => import('./components/LogView'))
const CharacterGenerator = lazy(() => import('./mork_borg/components/CharacterGenerator'))
const DiceDemo = lazy(() => import('./components/DiceDemo'))

export default function AppRoutes() {
  const navPosition = useSettingsStore(state => state.navPosition)
  const offsetClass = {
    top: 'mt-16',
    bottom: '',
    left: 'ml-24',
    right: 'mr-24'
  }[navPosition]

  return (
    <>
      <Navbar />
      <div className={offsetClass}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/characters" replace />} />
            <Route path="/characters" element={<StartPage />} />
            <Route path="/dices" element={<StartPage />} />
            <Route path="/trays" element={<StartPage />} />
            <Route path="/settings" element={<StartPage />} />
            <Route path="/generator" element={<CharacterGenerator />} />
            <Route path="/sheet/:id" element={<SheetPage />} />
            <Route path="/log" element={<LogView />} />
            <Route path="/dice-demo" element={<DiceDemo />} />
            <Route path="*" element={<Navigate to="/characters" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  )
}
