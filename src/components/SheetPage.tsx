import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { applyTheme } from '../theme'
import CharacterSheet from '../mork_borg/CharacterSheet'
import DiceDrawer from '../mork_borg/DiceDrawer'
import { useGameContext } from '../stores/GameContext'
import styles from './SheetPage.module.css'

export default function SheetPage() {
  const {
    state: { overlay },
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
    <div className={styles.page}>
      {/* Header Bar */}
      <header className={styles.header}>
        <button
          onClick={() => navigate('/roster')}
          className={styles.rosterButton}
        >
          ← ROSTER
        </button>
        <button
          onClick={() => setIsDiceDrawerOpen(!isDiceDrawerOpen)}
          className={styles.diceButton}
        >
          DICE ▾
        </button>
      </header>

      {/* Spacer for fixed header plus original 50px offset + 4px border */}
      <div className={styles.headerSpacer} />

      <DiceDrawer isOpen={isDiceDrawerOpen} onClose={() => setIsDiceDrawerOpen(false)} />

      <main className={styles.main}>
        <CharacterSheet />
      </main>

      {overlay.visible && (
        <div className={styles.overlayBackdrop}>
          <div className={styles.overlayCard}>
            <h2 className={styles.overlayTitle}>
              ROLL RESULT
            </h2>
            <div className={styles.overlayTotal}>
              {overlay.roll?.total}
            </div>
            <p className={styles.overlayMessage}>
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
              className={styles.overlayButton}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
