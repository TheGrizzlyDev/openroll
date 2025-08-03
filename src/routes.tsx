import { Routes, Route, Navigate } from 'react-router-dom'
import CharacterSelect from './components/CharacterSelect'
import SheetPage from './components/SheetPage'
import LogView from './components/LogView'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/characters" element={<CharacterSelect />} />
      <Route path="/sheet/:id" element={<SheetPage />} />
      <Route path="/log" element={<LogView />} />
      <Route path="*" element={<Navigate to="/characters" />} />
    </Routes>
  )
}
