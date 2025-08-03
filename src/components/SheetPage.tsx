import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import DiceRoller from '../DiceRoller'
import Inventory from '../Inventory'
import CharacterSheet from './CharacterSheet'
import LogView from './LogView'
import Overlay from './Overlay'
import { useGameContext } from '../GameContext'

export default function SheetPage() {
  const {
    activeTab,
    setActiveTab,
    overlay,
    setOverlay,
    overlayTimeout,
    loadCharacter
  } = useGameContext()
  const { id } = useParams()

  useEffect(() => {
    if (id !== undefined) {
      loadCharacter(parseInt(id, 10), { navigate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="container">
      <h1>Open Roll</h1>
      <Link to="/characters">Characters</Link>
      <DiceRoller />

      <div className="tabs">
        <button
          className={activeTab === 'character' ? 'active' : ''}
          onClick={() => setActiveTab('character')}
        >
          Character
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={activeTab === 'log' ? 'active' : ''}
          onClick={() => setActiveTab('log')}
        >
          Log
        </button>
      </div>

      {activeTab === 'character' && (
        <CharacterSheet />
      )}

      {activeTab === 'inventory' && (
        <Inventory />
      )}

      {activeTab === 'log' && <LogView />}

      <Overlay
        message={overlay.message}
        visible={overlay.visible}
        onClose={() => {
          if (overlayTimeout.current) clearTimeout(overlayTimeout.current)
          setOverlay((prev: any) => ({ ...prev, visible: false }))
        }}
      />
    </div>
  )
}
