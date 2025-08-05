import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import DiceRoller from '../DiceRoller'
import Inventory from '../morg_borg/Inventory'
import CharacterSheet from '../morg_borg/CharacterSheet'
import LogView from './LogView'
import Presets from './Presets'
import Overlay from './Overlay'
import { useGameContext } from '../GameContext'

export default function SheetPage() {
  const {
    state: { activeTab, overlay },
    dispatch,
    overlayTimeout,
    setOverlayTimeout,
    loadCharacter
  } = useGameContext()
  const { id } = useParams()

  useEffect(() => {
    if (id !== undefined) {
      loadCharacter(parseInt(id, 10))
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
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'character' })}
        >
          Character
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'inventory' })}
        >
          Inventory
        </button>
        <button
          className={activeTab === 'presets' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'presets' })}
        >
          Presets
        </button>
        <button
          className={activeTab === 'log' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'log' })}
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

      {activeTab === 'presets' && <Presets />}

      {activeTab === 'log' && <LogView />}

      <Overlay
        message={overlay.message}
        visible={overlay.visible}
        onClose={() => {
          if (overlayTimeout) clearTimeout(overlayTimeout)
          setOverlayTimeout(null)
          dispatch({ type: 'SET_OVERLAY', overlay: { ...overlay, visible: false } })
        }}
      />
    </div>
  )
}
