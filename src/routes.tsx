import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const CharacterSelect = lazy(() => import('./components/CharacterSelect'))
const SheetPage = lazy(() => import('./components/SheetPage'))
const LogView = lazy(() => import('./components/LogView'))
const CharacterGenerator = lazy(() => import('./morg_borg/components/CharacterGenerator'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/characters" element={<CharacterSelect />} />
        <Route path="/generator" element={<CharacterGenerator />} />
        <Route path="/sheet/:id" element={<SheetPage />} />
        <Route path="/log" element={<LogView />} />
        <Route path="*" element={<Navigate to="/characters" />} />
      </Routes>
    </Suspense>
  )
}
