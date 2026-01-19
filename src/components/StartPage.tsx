import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameContext } from '../stores/GameContext'
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

  const [deleteIdx, setDeleteIdx] = useState<number | null>(null)

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

  const confirmDelete = (idx: number) => setDeleteIdx(idx)

  const handleLoad = (idx: number) => {
    loadCharacter(idx)
    navigate(`/sheet/${idx}`)
  }

  const handleCreate = () => {
    createCharacter()
    navigate('/generator')
  }

  const cardStyle = {
    background: 'var(--color-bg-alt)',
    border: '1px solid color-mix(in srgb, var(--color-accent), transparent 70%)',
    borderRadius: '16px',
    padding: '1rem',
    boxShadow: '0 12px 24px rgb(0 0 0 / 18%)'
  } as const

  const tagStyle = {
    borderRadius: '999px',
    border: '1px solid color-mix(in srgb, var(--color-accent), transparent 60%)',
    padding: '0.2rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  } as const

  const statStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '12px',
    background: 'color-mix(in srgb, var(--color-bg), transparent 10%)',
    border: '1px solid color-mix(in srgb, var(--color-accent), transparent 75%)',
    minWidth: '88px'
  } as const

  const sortedIndexes = sortCharactersByLastAccess(characters, lastAccess)

  const pathTab = location.pathname.split('/')[1]
  const activeTab: StartTab =
    pathTab === 'roster' || pathTab === 'armory' || pathTab === 'settings'
      ? pathTab
      : 'roster'
  const renderTab = () => {
    switch (activeTab) {
      case 'roster':
        return (
          <Section
            title="Roster"
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
            {sortedIndexes.length === 0 ? (
              <div data-testid="roster-empty-card" style={cardStyle}>
                <Flex direction="column" gap="1rem">
                  <Flex gap="1.5rem" align="center" wrap="wrap">
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '24px',
                        background:
                          'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent), transparent 60%))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 700
                      }}
                    >
                      +
                    </div>
                    <div style={{ flex: '1 1 240px' }}>
                      <h3 style={{ margin: 0 }}>Build your roster</h3>
                      <p style={{ margin: '0.35rem 0 0' }}>
                        Add your first character and pick the system you want to
                        explore. We&apos;ll guide you through the generator next.
                      </p>
                    </div>
                  </Flex>
                  <Flex gap="0.75rem" wrap="wrap">
                    <Button onClick={handleCreate}>Select a System</Button>
                    <FileInput accept="application/json" onFileSelect={handleImport}>
                      Import Roster
                    </FileInput>
                  </Flex>
                </Flex>
              </div>
            ) : (
              <ul
                data-testid="roster-list"
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                }}
              >
                {sortedIndexes.map(originalIdx => (
                  <li key={originalIdx}>
                    <div data-testid="roster-card" style={cardStyle}>
                      <Flex direction="column" gap="1rem">
                        <Flex align="center" gap="1rem" wrap="wrap">
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '20px',
                              background:
                                'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent), transparent 60%))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.4rem',
                              fontWeight: 700
                            }}
                            aria-hidden="true"
                          >
                            {(characters[originalIdx].name || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div style={{ flex: '1 1 220px' }}>
                            <h3 style={{ margin: 0 }}>
                              {characters[originalIdx].name ||
                                `Character ${originalIdx + 1}`}
                            </h3>
                            <p style={{ margin: '0.25rem 0 0' }}>
                              {characters[originalIdx].sheet.class || 'Classless'}
                            </p>
                          </div>
                          <Flex gap="0.5rem" wrap="wrap">
                            <span data-testid="roster-system-tag" style={tagStyle}>
                              Mörk Borg
                            </span>
                            <span data-testid="roster-class-tag" style={tagStyle}>
                              {characters[originalIdx].sheet.class || 'Classless'}
                            </span>
                          </Flex>
                        </Flex>
                        <Flex gap="0.75rem" wrap="wrap">
                          <div data-testid="roster-stat-hp" style={statStyle}>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>HP</span>
                            <strong>
                              {characters[originalIdx].sheet.hp}/
                              {characters[originalIdx].sheet.maxHp}
                            </strong>
                          </div>
                          <div data-testid="roster-stat-omens" style={statStyle}>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                              Omens
                            </span>
                            <strong>{characters[originalIdx].sheet.omens}</strong>
                          </div>
                          <div data-testid="roster-stat-armor" style={statStyle}>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                              Armor
                            </span>
                            <strong>{characters[originalIdx].sheet.armor}</strong>
                          </div>
                        </Flex>
                        <Flex gap="0.5rem" wrap="wrap">
                          <Button onClick={() => handleLoad(originalIdx)}>Open</Button>
                          <Button onClick={() => confirmDelete(originalIdx)}>
                            Delete
                          </Button>
                        </Flex>
                      </Flex>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )
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
                      if (deleteIdx !== null) deleteCharacter(deleteIdx)
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
