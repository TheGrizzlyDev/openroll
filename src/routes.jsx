import { Routes, Route, Navigate } from 'react-router-dom'
import CharacterSelect from './components/CharacterSelect'
import SheetPage from './components/SheetPage'
import LogView from './components/LogView'

export default function AppRoutes(props) {
  const {
    characters,
    loadCharacter,
    deleteCharacter,
    createCharacter,
    sheet,
    setSheet,
    inventory,
    setInventory,
    log,
    logInventory,
    roll,
    activeTab,
    setActiveTab,
    overlay,
    setOverlay,
    overlayTimeout
  } = props

  return (
    <Routes>
      <Route
        path="/characters"
        element={
          <CharacterSelect
            characters={characters}
            onLoad={idx => loadCharacter(idx)}
            onDelete={idx => deleteCharacter(idx)}
            onCreate={createCharacter}
          />
        }
      />
      <Route
        path="/sheet/:id"
        element={
          <SheetPage
            sheet={sheet}
            setSheet={setSheet}
            inventory={inventory}
            setInventory={setInventory}
            log={log}
            logInventory={logInventory}
            roll={roll}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            overlay={overlay}
            setOverlay={setOverlay}
            overlayTimeout={overlayTimeout}
            loadCharacter={loadCharacter}
          />
        }
      />
      <Route path="/log" element={<LogView log={log} />} />
      <Route path="*" element={<Navigate to="/characters" />} />
    </Routes>
  )
}
