import { useEffect, type CSSProperties, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DiceRoller from '../DiceRoller'
import Inventory from '../mork_borg/Inventory'
import CharacterSheet from '../mork_borg/CharacterSheet'
import LogView from './LogView'
import Notes from './Notes'
import { useGameContext } from '../stores/GameContext'
import { Tabs, Button, Input, Dialog } from './ui'
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
  )

  return (
    <PageContainer title={characterTitle}>
      <Tabs.Root
        value={activeTab}
        onValueChange={tab => dispatch({ type: 'SET_ACTIVE_TAB', tab })}
      >
        <SheetTabsNav />
        <Section title={tabTitle}>
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

function SheetTabsNav() {
  const {
    navBgColorLight,
    navBgColorDark,
    navBgOpacityLight,
    navBgOpacityDark,
    navCornerRadius,
    navShadowColorLight,
    navShadowColorDark,
    navShadowOpacityLight,
    navShadowOpacityDark,
    navButtonVariant,
    navActiveButtonVariant,
    theme: themeMode,
  } = useSettingsStore()
  const {
    state: { activeTab },
  } = useGameContext()
  const navigate = useNavigate()

  const [appearance, setAppearance] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => setAppearance(mq.matches ? 'dark' : 'light')
    if (themeMode === 'auto') {
      apply()
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    } else {
      setAppearance(themeMode)
    }
  }, [themeMode])

  const bgColor = appearance === 'dark' ? navBgColorDark : navBgColorLight
  const opacity = appearance === 'dark' ? navBgOpacityDark : navBgOpacityLight
  const background = `rgba(${hexToRgb(bgColor)}, ${opacity})`
  const shadowColor =
    appearance === 'dark' ? navShadowColorDark : navShadowColorLight
  const shadowOpacity =
    appearance === 'dark' ? navShadowOpacityDark : navShadowOpacityLight
  const boxShadowColor = `rgba(${hexToRgb(shadowColor)}, ${shadowOpacity})`

  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const style: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    background,
    padding: 'var(--space-2)',
    borderTopLeftRadius: stuck ? 0 : `${navCornerRadius}px`,
    borderTopRightRadius: stuck ? 0 : `${navCornerRadius}px`,
    borderBottomLeftRadius: `${navCornerRadius}px`,
    borderBottomRightRadius: `${navCornerRadius}px`,
    transition: 'border-radius 200ms, padding-left 200ms',
    backdropFilter: 'blur(10px)',
    marginBottom: 'var(--space-2)',
    boxShadow: `0 2px 6px ${boxShadowColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  }

  return (
    <div style={style}>
      <Tabs.List asChild>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Button variant="ghost" onClick={() => navigate('/characters')}>
            ← Back
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Tabs.Trigger asChild value="character">
              <Button
                {...buttonProps(
                  activeTab === 'character'
                    ? navActiveButtonVariant
                    : navButtonVariant,
                  activeTab === 'character'
                )}
              >
                Character
              </Button>
            </Tabs.Trigger>
            <Tabs.Trigger asChild value="inventory">
              <Button
                {...buttonProps(
                  activeTab === 'inventory'
                    ? navActiveButtonVariant
                    : navButtonVariant,
                  activeTab === 'inventory'
                )}
              >
                Inventory
              </Button>
            </Tabs.Trigger>
            <Tabs.Trigger asChild value="notes">
              <Button
                {...buttonProps(
                  activeTab === 'notes'
                    ? navActiveButtonVariant
                    : navButtonVariant,
                  activeTab === 'notes'
                )}
              >
                Notes
              </Button>
            </Tabs.Trigger>
            <Tabs.Trigger asChild value="log">
              <Button
                {...buttonProps(
                  activeTab === 'log'
                    ? navActiveButtonVariant
                    : navButtonVariant,
                  activeTab === 'log'
                )}
              >
                Log
              </Button>
            </Tabs.Trigger>
          </div>
          <DiceRoller />
        </nav>
      </Tabs.List>
    </div>
  )
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const num = parseInt(normalized, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r},${g},${b}`
}

function buttonProps(variant: ButtonVariant, active = false) {
  if (variant === 'ghost') {
    return {
      variant: 'surface' as ButtonVariant,
      style: {
        backgroundColor: active ? 'var(--accent-9)' : 'transparent',
        boxShadow: 'none',
        color: active ? 'var(--accent-1)' : 'inherit',
      },
    }
  }
  return { variant }
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
