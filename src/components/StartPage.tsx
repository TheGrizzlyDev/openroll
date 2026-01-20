import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameContext } from '../stores/GameContext'
import { applyTheme } from '../theme'
import { FileInput } from './FileInput'
import {
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
} from './ui'
import { PageContainer, Section, Flex } from '../layout'
import { sortCharactersByLastAccess } from '../sortCharactersByLastAccess'
import { SystemCard } from './SystemCard'
import UnderConstruction from './UnderConstruction'

type StartTab = 'roster' | 'armory' | 'settings'

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

  const [search, setSearch] = useState('')
  const [systemFilter, setSystemFilter] = useState<string>('All Systems')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null)

  // Apply Nexus theme on mount
  useEffect(() => {
    applyTheme('nexus')
  }, [])

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

  const sortedIndexes = sortCharactersByLastAccess(characters, lastAccess)

  const confirmDelete = (idx: number) => setDeleteIdx(idx)

  const handleLoad = (idx: number) => {
    loadCharacter(idx)
    navigate(`/sheet/${idx}`)
  }

  const handleCreate = () => {
    setIsCreating(true)
  }

  const confirmSystemSelection = () => {
    if (selectedSystem === 'Mörk Borg') {
      createCharacter()
      navigate('/generator')
    } else {
      alert('Only Mörk Borg is supported currently.')
    }
  }

  const filteredCharacters = sortedIndexes.filter(idx => {
    const char = characters[idx]
    const matchesSearch = (char.name || '').toLowerCase().includes(search.toLowerCase())
    const matchesSystem = systemFilter === 'All Systems' || (systemFilter === 'Mörk Borg' && true)
    return matchesSearch && matchesSystem
  })

  // Styles
  const searchInputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: 'var(--color-surface-dim)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '1rem',
    outline: 'none'
  } as const

  const filterPillStyle = (isActive: boolean) => ({
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    background: isActive ? 'var(--color-accent)' : 'var(--color-surface-dim)',
    color: isActive ? '#fff' : 'var(--color-text-dim)',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s'
  }) as const

  const characterCardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  } as const

  const renderSystemSelection = () => (
    <Section title="Choose a System">
      <div style={{ display: 'grid', gap: '1rem' }}>
        <SystemCard
          title="Mörk Borg"
          description="A doom-laden artpunk RPG about a dying world."
          selected={selectedSystem === 'Mörk Borg'}
          onClick={() => setSelectedSystem('Mörk Borg')}
          image={<span style={{ fontSize: '2rem' }}>💀</span>}
        />
        <SystemCard
          title="Mothership"
          description="Sci-fi horror where the most dangerous thing in space is your own fear."
          selected={selectedSystem === 'Mothership'}
          onClick={() => setSelectedSystem('Mothership')}
          image={<span style={{ fontSize: '2rem' }}>🚀</span>}
        />
        <SystemCard
          title="Pirate Borg"
          description="A scurvy-ridden RPG of maritime horror and skeleton-filled seas."
          selected={selectedSystem === 'Pirate Borg'}
          onClick={() => setSelectedSystem('Pirate Borg')}
          image={<span style={{ fontSize: '2rem' }}>⛵</span>}
        />
      </div>
      <Flex justify="end" style={{ marginTop: '2rem' }}>
        <Flex gap="1rem">
          <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
          <Button onClick={confirmSystemSelection} disabled={!selectedSystem}>Confirm Selection</Button>
        </Flex>
      </Flex>
    </Section>
  )

  const renderRoster = () => {
    if (isCreating) return renderSystemSelection()

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Controls */}
        <Flex direction="column" gap="1rem">
          <input
            type="text"
            placeholder="Search characters..."
            className="search-input"
            style={searchInputStyle}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Flex gap="0.5rem" wrap="wrap">
            {['All Systems', 'Mörk Borg', 'D&D 5e', 'Star Wars'].map(sys => (
              <button
                key={sys}
                style={filterPillStyle(systemFilter === sys)}
                onClick={() => setSystemFilter(sys)}
              >
                {sys}
              </button>
            ))}
          </Flex>
        </Flex>

        {/* Character List */}
        <div>
          <Flex justify="between" align="center" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Characters
            </h3>
            <Button onClick={handleCreate} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              + Create New
            </Button>
          </Flex>

          {filteredCharacters.length === 0 ? (
            <div
              data-testid="roster-empty-card"
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px dashed var(--color-border)'
              }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                opacity: 0.2
              }}>
                📖
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>The Roster is Empty</h2>
              <p style={{ color: 'var(--color-text-dim)', marginBottom: '2rem', maxWidth: '400px', marginInline: 'auto' }}>
                Your journey has not yet begun. No wretches, crew, or warriors are under your command.
              </p>
              <Flex gap="1rem" justify="center">
                <Button onClick={handleCreate} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                  + Create Character
                </Button>
                <FileInput accept="application/json" onFileSelect={handleImport}>
                  Import Roster
                </FileInput>
              </Flex>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredCharacters.map(idx => {
                const char = characters[idx]
                return (
                  <div
                    key={idx}
                    onClick={() => handleLoad(idx)}
                    style={characterCardStyle}
                    data-testid="roster-card"
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'var(--color-surface-dim)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Placeholder Avatar */}
                      {char.sheet.class === 'Fanged Deserter' ? '🦷' :
                        char.sheet.class === 'Gutterborn Scum' ? '🐀' : '💀'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)', // Or system specific color
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                      }}>
                        Mörk Borg
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{char.name || 'Nameless Wretch'}</h3>
                      <div style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        HP: {char.sheet.hp}/{char.sheet.maxHp} • {char.sheet.class || 'Classless'}
                      </div>
                    </div>

                    <div style={{ color: 'var(--color-text-dim)', fontSize: '1.5rem' }}>
                      ›
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const pathTab = location.pathname.split('/')[1]
  const activeTab: StartTab =
    pathTab === 'roster' || pathTab === 'armory' || pathTab === 'settings'
      ? pathTab
      : 'roster'

  const renderTab = () => {
    switch (activeTab) {
      case 'roster':
        return renderRoster()
      case 'armory':
        return <UnderConstruction title="Armory" />
      case 'settings':
        return <UnderConstruction title="Settings" />
      default:
        return null
    }
  }

  return (
    <>
      <PageContainer>{renderTab()}</PageContainer>

      {/* Delete Dialog */}
      {deleteIdx !== null && (
        <DialogRoot
          open
          onOpenChange={open => {
            if (!open) setDeleteIdx(null)
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <p>Delete this character?</p>
              <Flex justify="end" gap="var(--space-2)">
                <DialogCloseTrigger asChild>
                  <Button type="button">Cancel</Button>
                </DialogCloseTrigger>
                <DialogCloseTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => {
                      if (deleteIdx !== null) {
                        deleteCharacter(deleteIdx)
                        setDeleteIdx(null)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </DialogCloseTrigger>
              </Flex>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}

      {overlay.visible && (
        <DialogRoot
          open={overlay.visible}
          onOpenChange={open => {
            if (!open) {
              if (overlayTimeout) clearTimeout(overlayTimeout)
              setOverlayTimeout(null)
              dispatch({ type: 'SET_OVERLAY', overlay: { ...overlay, visible: false } })
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <span>{overlay.message}</span>
              <DialogCloseTrigger asChild>
                <Button type="button">×</Button>
              </DialogCloseTrigger>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}
    </>
  )
}
