import { useEffect, type CSSProperties, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { applyTheme } from '../theme'
import DiceRoller from '../DiceRoller'
import Inventory from '../mork_borg/Inventory'
import CharacterSheet from '../mork_borg/CharacterSheet'
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

  const [editingName, setEditingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  // Apply Mork Borg theme when entering the sheet
  useEffect(() => {
    applyTheme('dark')
  }, [])

  useEffect(() => {
    if (id !== undefined) {
      loadCharacter(parseInt(id, 10))
    }
  }, [id, loadCharacter])

  const tabTitle =
    activeTab === 'character'
      ? 'Character'
      : activeTab === 'inventory'
        ? 'Inventory'
        : activeTab === 'notes'
          ? 'Notes'
          : 'Log'

  const characterTitle = (
    <Flex align="center" gap="var(--space-2)">
      <RealmBackButton />
      <Flex align="center" gap="var(--space-2)">
        {editingName ? (
          <Input
            ref={nameInputRef}
            value={sheet.name}
            onChange={e =>
              dispatch({ type: 'SET_SHEET', sheet: { ...sheet, name: e.target.value } })
            }
            onBlur={() => setEditingName(false)}
            onKeyDown={e => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            aria-label="Character name"
            style={{ width: 'auto' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            {sheet.name}
          </button>
        )}
        <span>– Mörk Borg</span>
      </Flex>
    </Flex>
  )

  return (
    <PageContainer title={characterTitle}>
      <Section title="">
        <CharacterSheet />
        <Inventory />
        <Notes />
        <LogView />
      </Section>

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
    </PageContainer>
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


