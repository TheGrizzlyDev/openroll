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
  DialogCloseTrigger,
} from './ui'
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
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1100,
        boxSizing: 'border-box',
        borderBottom: '4px solid #E61E8D'
      }}>
        <button
          onClick={() => navigate('/roster')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.9rem',
            fontWeight: '900',
            cursor: 'pointer',
            padding: '0.25rem 0',
            textTransform: 'uppercase',
            textDecoration: 'underline'
          }}
        >
          ← ROSTER
        </button>
        <button
          onClick={() => setIsDiceDrawerOpen(!isDiceDrawerOpen)}
          style={{
            background: '#E61E8D',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1rem',
            fontWeight: '900',
            padding: '0.5rem 1.25rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          DICE ▾
        </button>
      </header>

      {/* Spacer for fixed header plus original 50px offset + 4px border */}
      <div style={{ height: '64px' }} />

      <DiceDrawer isOpen={isDiceDrawerOpen} onClose={() => setIsDiceDrawerOpen(false)} />

      <main style={{ paddingBottom: '4rem', marginTop: '1rem' }}>
        <CharacterSheet />
      </main>

      {overlay.visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '2rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#000',
            color: '#FFF',
            border: '8px solid #E61E8D',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: '20px 20px 0 #E61E8D'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '1.5rem', color: '#E61E8D' }}>
              ROLL RESULT
            </h2>
            <div style={{ fontSize: '7rem', fontWeight: 950, marginBottom: '1rem', lineHeight: 1 }}>
              {overlay.roll?.total}
            </div>
            <p style={{ fontSize: '1.5rem', opacity: 1, fontWeight: 700, margin: '1rem 0 2rem' }}>
              {overlay.message}
            </p>
            <button
              onClick={() => {
                if (overlayTimeout) clearTimeout(overlayTimeout)
                setOverlayTimeout(null)
                dispatch({
                  type: 'SET_OVERLAY',
                  overlay: { ...overlay, visible: false, roll: null }
                })
              }}
              style={{
                width: '100%',
                background: '#E61E8D',
                color: '#FFF',
                fontWeight: 950,
                fontSize: '1.5rem',
                padding: '1rem',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              OK
            </button>
          </div>
        </div>
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


