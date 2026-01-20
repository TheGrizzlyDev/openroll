import { useEffect, type CSSProperties, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { applyTheme } from '../theme'
import DiceRoller from '../DiceRoller'
import Inventory from '../mork_borg/Inventory'
import CharacterSheet from '../mork_borg/CharacterSheet'
import DiceDrawer from '../mork_borg/DiceDrawer'
import LogView from './LogView'
import Notes from './Notes'
import { useGameContext } from '../stores/GameContext'
import RealmBackButton from './RealmBackButton'
import {
  Button,
  Input,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
} from './ui'
import { Canvas } from '@react-three/fiber'
import Dice3D from './Dice3D'
import DiceTray from './DiceTray'
import { PageContainer, Section } from '../layout'
import { useSettingsStore, type ButtonVariant } from '../stores/settingsStore'
import { Flex } from '@radix-ui/themes'

export default function SheetPage() {
  const {
    state: { activeTab, overlay, sheet },
    dispatch,
    overlayTimeout,
    setOverlayTimeout,
    loadCharacter
  } = useGameContext()
  const { id } = useParams()
  const navigate = useNavigate()

  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState(false)

  useEffect(() => {
    applyTheme('dark')
  }, [])

  useEffect(() => {
    if (id !== undefined) {
      const idx = parseInt(id, 10)
      if (!isNaN(idx)) {
        loadCharacter(idx)
      } else {
        const { characters } = useGameContext.getState().state
        const foundIdx = characters.findIndex(c => c.id === id)
        if (foundIdx !== -1) {
          loadCharacter(foundIdx)
        }
      }
    }
  }, [id, loadCharacter])

  return (
    <div style={{ background: '#F7D02C', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Header Bar */}
      <header style={{
        background: '#000000',
        color: '#FFFFFF',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 1100
      }}>
        <button
          onClick={() => navigate('/roster')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1rem',
            fontWeight: '900',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ← ROSTER
        </button>
        <button
          onClick={() => setIsDiceDrawerOpen(!isDiceDrawerOpen)}
          style={{
            background: '#E61E8D',
            border: 'none',
            color: '#000000',
            fontSize: '1rem',
            fontWeight: '900',
            padding: '0.25rem 1rem',
            cursor: 'pointer'
          }}
        >
          DICE
        </button>
      </header>

      <DiceDrawer isOpen={isDiceDrawerOpen} onClose={() => setIsDiceDrawerOpen(false)} />

      <main style={{ paddingBottom: '4rem' }}>
        <CharacterSheet />
      </main>

      {overlay.visible && (
        <DialogRoot
          open={overlay.visible}
          onOpenChange={open => {
            if (!open) {
              if (overlayTimeout) clearTimeout(overlayTimeout)
              setOverlayTimeout(null)
              dispatch({
                type: 'SET_OVERLAY',
                overlay: { ...overlay, visible: false, roll: null }
              })
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              {overlay.roll ? (
                <>
                  <Canvas
                    className="dice-preview"
                    camera={{ position: [0, 5, 5], fov: 50 }}
                    shadows
                    style={{ height: '300px' }}
                  >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 10, 5]} />
                    <DiceTray>
                      {overlay.roll.dice.map((die, i) => (
                        <Dice3D
                          key={i}
                          type={die.type}
                          rollResult={die.result}
                          position={[
                            (i - (overlay.roll!.dice.length - 1) / 2) * 2,
                            1,
                            0
                          ]}
                        />
                      ))}
                    </DiceTray>
                  </Canvas>
                  <div>{overlay.message}</div>
                  <span style={srOnly} aria-live="polite">
                    {overlay.message}
                  </span>
                </>
              ) : (
                <span>{overlay.message}</span>
              )}
              <DialogCloseTrigger asChild>
                <Button type="button">×</Button>
              </DialogCloseTrigger>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
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


