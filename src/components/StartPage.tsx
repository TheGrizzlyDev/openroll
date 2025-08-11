import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameContext } from '../GameContext'
import { FileInput } from './FileInput'
import { Button } from '../design-system'
import { Dialog, ark } from '@ark-ui/react'
import { PageContainer, Section, Stack, Flex } from '../layout'
import { sortCharactersByLastAccess } from '../sortCharactersByLastAccess'
import { useDiceSetStore, type DiceSet } from '../diceSetStore'
import { useTraySetStore } from '../traySetStore'
import GeneralSettings from './GeneralSettings'

type StartTab = 'characters' | 'dices' | 'trays' | 'settings'

export default function StartPage() {
    const {
      state: { characters, lastAccess, overlay },
      dispatch,
      loadCharacter,
      deleteCharacter,
      createCharacter,
      exportCharacters,
    importCharacters,
    overlayTimeout,
    setOverlayTimeout
  } = useGameContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleExport = () => {
    const data = exportCharacters()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'characters.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = ({ target }: ProgressEvent<FileReader>) => {
      const data = target?.result as string
      const success = importCharacters(data)
      if (!success) {
        dispatch({
          type: 'SET_OVERLAY',
          overlay: { message: 'Failed to import characters', roll: null, visible: true }
        })
      } else {
        let count = 0
        try {
          const parsed = JSON.parse(data)
          count = Array.isArray(parsed) ? parsed.length : 0
        } catch {
          count = 0
        }
        dispatch({
          type: 'SET_OVERLAY',
          overlay: {
            message: `${count} character${count === 1 ? '' : 's'} imported`,
            roll: null,
            visible: true
          }
        })
      }
      if (overlayTimeout) clearTimeout(overlayTimeout)
      const timeout = setTimeout(
        () => dispatch({ type: 'SET_OVERLAY', overlay: { ...overlay, visible: false } }),
        10000
      )
      setOverlayTimeout(timeout)
    }
    reader.readAsText(file)
  }

  const confirmDelete = (idx: number) =>
    window.confirm('Delete this character?') && deleteCharacter(idx)

  const handleLoad = (idx: number) => {
    loadCharacter(idx)
    navigate(`/sheet/${idx}`)
  }

  const handleCreate = () => {
    createCharacter()
    navigate('/generator')
  }

    const sortedIndexes = sortCharactersByLastAccess(characters, lastAccess)

  const diceSets = useDiceSetStore(state => state.sets)
  const activateDiceSet = useDiceSetStore(state => state.activateSet)
  const sortedDiceSets = [...diceSets].sort((a, b) => b.updatedAt - a.updatedAt)

  const { sets: traySets, setActive: setActiveTraySet } = useTraySetStore(state => ({
    sets: state.sets,
    setActive: state.setActive
  }))
  const activeTraySet = traySets.find(s => s.active)?.id ?? null

  const activeTab = location.pathname.split('/')[1] as StartTab

  const DiceSetCard = ({ set }: { set: DiceSet }) => {
    const { id, name, active } = set
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const color = `hsl(${Math.floor(Math.random() * 360)} 70% 50%)`
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(25, 25, 20, 0, Math.PI * 2)
      ctx.fill()
    }, [])
    return (
      <Stack
        gap="0.5rem"
        style={{
          padding: '0.5rem',
          border: '1px solid',
          borderRadius: '0.25rem',
          alignItems: 'center'
        }}
      >
        <canvas ref={canvasRef} width={50} height={50} />
        <Button onClick={() => activateDiceSet(id)} disabled={active}>
          {active ? 'Active' : 'Use'}
        </Button>
        <div>{name}</div>
      </Stack>
    )
  }

  const TraySetCard = ({ id, name }: { id: string; name: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const color = `hsl(${Math.floor(Math.random() * 360)} 70% 50%)`
      ctx.fillStyle = color
      ctx.fillRect(5, 5, 40, 40)
    }, [])
    return (
      <Stack
        gap="0.5rem"
        style={{
          padding: '0.5rem',
          border: '1px solid',
          borderRadius: '0.25rem',
          alignItems: 'center'
        }}
      >
        <canvas ref={canvasRef} width={50} height={50} />
        <Button onClick={() => setActiveTraySet(id)} disabled={activeTraySet === id}>
          {activeTraySet === id ? 'Active' : 'Use'}
        </Button>
        <div>{name}</div>
      </Stack>
    )
  }

  const NoTrayCard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const color = `hsl(${Math.floor(Math.random() * 360)} 70% 50%)`
      ctx.fillStyle = color
      ctx.fillRect(5, 5, 40, 40)
    }, [])
    return (
      <Stack
        gap="0.5rem"
        style={{
          padding: '0.5rem',
          border: '1px solid',
          borderRadius: '0.25rem',
          alignItems: 'center'
        }}
      >
        <canvas ref={canvasRef} width={50} height={50} />
        <Button onClick={() => setActiveTraySet(null)} disabled={activeTraySet === null}>
          {activeTraySet === null ? 'Active' : 'Use'}
        </Button>
        <div>No Tray</div>
      </Stack>
    )
  }
  const renderTab = () => {
    switch (activeTab) {
      case 'characters':
        return (
          <Section
            title="Characters"
            actions={
              <>
                <Button onClick={handleCreate}>Create New</Button>
                <Button onClick={handleExport}>Export</Button>
                <FileInput accept="application/json" onFileSelect={handleImport}>
                  Import
                </FileInput>
              </>
            }
          >
              <Stack
                asChild
                gap="0.5rem"
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                <ark.ul>
                  {sortedIndexes.map(originalIdx => (
                    <Flex asChild key={originalIdx} gap="0.5rem">
                      <ark.li>
                        <Button onClick={() => handleLoad(originalIdx)}>
                          {characters[originalIdx].name || `Character ${originalIdx + 1}`}
                        </Button>
                        <Button onClick={() => confirmDelete(originalIdx)}>
                          Delete
                        </Button>
                      </ark.li>
                    </Flex>
                  ))}
                </ark.ul>
              </Stack>
          </Section>
        )
      case 'dices':
        return (
          <Section title="Dices">
            <Flex gap="1rem" wrap="wrap">
              {sortedDiceSets.map(set => (
                <DiceSetCard key={set.id} set={set} />
              ))}
            </Flex>
          </Section>
        )
      case 'trays':
        return (
          <Section title="Trays">
            <Flex gap="1rem" wrap="wrap">
              <NoTrayCard />
              {traySets.map(set => (
                <TraySetCard key={set.id} id={set.id} name={set.name} />
              ))}
            </Flex>
          </Section>
        )
      case 'settings':
        return (
          <Section title="Settings">
            <Stack gap="1rem">
              <Section title="General Settings">
                <Stack gap="1rem">
                  <GeneralSettings />
                </Stack>
              </Section>
            </Stack>
          </Section>
        )
      default:
        return null
    }
  }
  return (
    <>
      <PageContainer title="Open Roll">
        {renderTab()}
      </PageContainer>

        {overlay.visible && (
          <Dialog.Root
            open={overlay.visible}
            onOpenChange={({ open }) => {
              if (!open) {
                if (overlayTimeout) clearTimeout(overlayTimeout)
                setOverlayTimeout(null)
                dispatch({ type: 'SET_OVERLAY', overlay: { ...overlay, visible: false } })
              }
            }}
          >
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <span>{overlay.message}</span>
                <Dialog.CloseTrigger asChild>
                  <Button type="button">×</Button>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
    </>
  )
}
