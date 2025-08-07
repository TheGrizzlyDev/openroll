import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import DiceRoller from '../DiceRoller'
import Inventory from '../morg_borg/Inventory'
import CharacterSheet from '../morg_borg/CharacterSheet'
import LogView from './LogView'
import Notes from './Notes'
import Popup from './Popup'
import { useGameContext } from '../GameContext'
import { Button } from '../ui'
import { Canvas } from '@react-three/fiber'
import Dice3D from './Dice3D'

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
        <Button
          className={activeTab === 'character' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'character' })}
        >
          Character
        </Button>
        <Button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'inventory' })}
        >
          Inventory
        </Button>
        <Button
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'notes' })}
        >
          Notes
        </Button>
        <Button
          className={activeTab === 'log' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'log' })}
        >
          Log
        </Button>
      </div>

      {activeTab === 'character' && (
        <CharacterSheet />
      )}

      {activeTab === 'inventory' && (
        <Inventory />
      )}

      {activeTab === 'notes' && <Notes />}

      {activeTab === 'log' && <LogView />}

      {overlay.visible && (
        <Popup
          visible={overlay.visible}
          onClose={() => {
            if (overlayTimeout) clearTimeout(overlayTimeout)
            setOverlayTimeout(null)
            dispatch({
              type: 'SET_OVERLAY',
              overlay: { ...overlay, visible: false, roll: null }
            })
          }}
        >
          {overlay.roll ? (
            <>
              <Canvas
                style={{ width: 100, height: 100 }}
                camera={{ position: [0, 0, 3] }}
              >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Dice3D type={overlay.roll.type} rollResult={overlay.roll.result} />
              </Canvas>
              <div>{overlay.message}</div>
              <span style={srOnly} aria-live="polite">
                {overlay.message}
              </span>
            </>
          ) : (
            <span>{overlay.message}</span>
          )}
        </Popup>
      )}
    </div>
  )
}

const srOnly: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
}
