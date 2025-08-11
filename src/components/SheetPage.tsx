import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import DiceRoller from '../DiceRoller'
import Inventory from '../mork_borg/Inventory'
import CharacterSheet from '../mork_borg/CharacterSheet'
import LogView from './LogView'
import Notes from './Notes'
import { useGameContext } from '../GameContext'
import { Tabs, Button } from '../design-system'
import { Dialog } from '@ark-ui/react'
import { Canvas } from '@react-three/fiber'
import Dice3D from './Dice3D'
import DiceTray from './DiceTray'
import { PageContainer, Section } from '../layout'

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

  const tabTitle =
    activeTab === 'character'
      ? 'Character'
      : activeTab === 'inventory'
        ? 'Inventory'
        : activeTab === 'notes'
          ? 'Notes'
          : 'Log'

  return (
    <PageContainer
      title="Open Roll"
      headerActions={<Link to="/">Characters</Link>}
    >
      <DiceRoller />
      <Tabs.Root
        value={activeTab}
        onValueChange={({ value: tab }) => dispatch({ type: 'SET_ACTIVE_TAB', tab })}
      >
        <Section
          title={tabTitle}
          actions={
            <Tabs.List>
              <Tabs.Trigger value="character">Character</Tabs.Trigger>
              <Tabs.Trigger value="inventory">Inventory</Tabs.Trigger>
              <Tabs.Trigger value="notes">Notes</Tabs.Trigger>
              <Tabs.Trigger value="log">Log</Tabs.Trigger>
            </Tabs.List>
          }
        >
          <Tabs.Content value="character">
            <CharacterSheet />
          </Tabs.Content>

          <Tabs.Content value="inventory">
            <Inventory />
          </Tabs.Content>

          <Tabs.Content value="notes">
            <Notes />
          </Tabs.Content>

          <Tabs.Content value="log">
            <LogView />
          </Tabs.Content>
        </Section>
      </Tabs.Root>

        {overlay.visible && (
          <Dialog.Root
            open={overlay.visible}
            onOpenChange={({ open }) => {
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
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
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
                <Dialog.CloseTrigger asChild>
                  <Button type="button">×</Button>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
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
