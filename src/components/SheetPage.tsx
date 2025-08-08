import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import DiceRoller from '../DiceRoller'
import Inventory from '../mork_borg/Inventory'
import CharacterSheet from '../mork_borg/CharacterSheet'
import LogView from './LogView'
import Notes from './Notes'
import { useGameContext } from '../GameContext'
import { Dialog, Tabs, TabList, Tab, TabPanel } from '../design-system'
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
      headerActions={<Link to="/characters">Characters</Link>}
    >
      <DiceRoller />
      <Tabs
        value={activeTab}
        onValueChange={(tab) => dispatch({ type: 'SET_ACTIVE_TAB', tab })}
      >
        <Section
          title={tabTitle}
          actions={
            <TabList>
              <Tab value="character">Character</Tab>
              <Tab value="inventory">Inventory</Tab>
              <Tab value="notes">Notes</Tab>
              <Tab value="log">Log</Tab>
            </TabList>
          }
        >
          <TabPanel value="character">
            <CharacterSheet />
          </TabPanel>

          <TabPanel value="inventory">
            <Inventory />
          </TabPanel>

          <TabPanel value="notes">
            <Notes />
          </TabPanel>

          <TabPanel value="log">
            <LogView />
          </TabPanel>
        </Section>
      </Tabs>

      {overlay.visible && (
        <Dialog
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
        </Dialog>
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
