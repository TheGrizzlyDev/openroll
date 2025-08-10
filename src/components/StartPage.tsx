import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../GameContext'
import { FileInput } from './FileInput'
import { Button, Dialog } from '../design-system'
import DiceStyleSelector from './DiceStyleSelector'
import { PageContainer, Section } from '../layout'
import { sortCharactersByLastAccess } from '../sortCharactersByLastAccess'
import { useDiceSetStore, type DiceSet } from '../diceSetStore'
import { useTraySetStore } from '../traySetStore'
import { useStartPageStore } from '../startPageStore'
import GeneralSettings from './GeneralSettings'
import MorkBorgSettings from '../mork_borg/components/GameSettings'

export default function StartPage() {
  const {
    state: { characters, overlay },
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

  const sortedCharacters = sortCharactersByLastAccess(characters)

  const diceSets = useDiceSetStore(state => state.sets)
  const activateDiceSet = useDiceSetStore(state => state.activateSet)
  const sortedDiceSets = [...diceSets].sort((a, b) => b.updatedAt - a.updatedAt)

  const { sets: traySets, setActive: setActiveTraySet } = useTraySetStore(state => ({
    sets: state.sets,
    setActive: state.setActive
  }))
  const activeTraySet = traySets.find(s => s.active)?.id ?? null

  const activeTab = useStartPageStore(state => state.activeTab)

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
      <div className="p-2 border rounded flex flex-col items-center gap-2">
        <canvas ref={canvasRef} width={50} height={50} />
        <Button onClick={() => activateDiceSet(id)} disabled={active}>
          {active ? 'Active' : 'Use'}
        </Button>
        <div>{name}</div>
      </div>
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
      <div className="p-2 border rounded flex flex-col items-center gap-2">
        <canvas ref={canvasRef} width={50} height={50} />
        <Button onClick={() => setActiveTraySet(id)} disabled={activeTraySet === id}>
          {activeTraySet === id ? 'Active' : 'Use'}
        </Button>
        <div>{name}</div>
      </div>
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
      <div className="p-2 border rounded flex flex-col items-center gap-2">
        <canvas ref={canvasRef} width={50} height={50} />
        <Button onClick={() => setActiveTraySet(null)} disabled={activeTraySet === null}>
          {activeTraySet === null ? 'Active' : 'Use'}
        </Button>
        <div>No Tray</div>
      </div>
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
            <ul className="character-list">
              {sortedCharacters.map((c, idx) => (
                <li key={idx}>
                  <Button onClick={() => handleLoad(idx)}>
                    {c.name || `Character ${idx + 1}`}
                  </Button>
                  <Button onClick={() => confirmDelete(idx)}>Delete</Button>
                </li>
              ))}
            </ul>
            <DiceStyleSelector />
          </Section>
        )
      case 'dices':
        return (
          <Section title="Dices">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sortedDiceSets.map(set => (
                <DiceSetCard key={set.id} set={set} />
              ))}
            </div>
          </Section>
        )
      case 'trays':
        return (
          <Section title="Trays">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NoTrayCard />
              {traySets.map(set => (
                <TraySetCard key={set.id} id={set.id} name={set.name} />
              ))}
            </div>
          </Section>
        )
      case 'settings':
        return (
          <Section title="Settings">
            <div className="flex flex-col gap-4">
              <Section title="General Settings">
                <GeneralSettings />
              </Section>
              <Section title="Mörk Borg Settings">
                <MorkBorgSettings />
              </Section>
            </div>
          </Section>
        )
      default:
        return null
    }
  }
  return (
    <>
      <PageContainer title="Open Roll" startScreen>
        {renderTab()}
      </PageContainer>

      {overlay.visible && (
        <Dialog
          visible={overlay.visible}
          onClose={() => {
            if (overlayTimeout) clearTimeout(overlayTimeout)
            setOverlayTimeout(null)
            dispatch({ type: 'SET_OVERLAY', overlay: { ...overlay, visible: false } })
          }}
        >
          <span>{overlay.message}</span>
        </Dialog>
      )}
    </>
  )
}
