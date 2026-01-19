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
import { PageContainer, Section, Stack, Flex } from '../layout'
import { sortCharactersByLastAccess } from '../sortCharactersByLastAccess'

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
              <p>No characters yet. Create a new one to get started.</p>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {sortedIndexes.map(originalIdx => (
                  <li key={originalIdx}>
                    <Flex gap="0.5rem">
                      <Button onClick={() => handleLoad(originalIdx)}>
                        {characters[originalIdx].name || `Character ${originalIdx + 1}`}
                      </Button>
                      <Button onClick={() => confirmDelete(originalIdx)}>
                        Delete
                      </Button>
                    </Flex>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )
      case 'armory':
        return (
          <Section title="Armory">
            <Stack gap="0.5rem">
              <p>Armory tools and loadouts are coming soon.</p>
              <p>Check back for equipment presets and shared loadouts.</p>
            </Stack>
          </Section>
        )
      case 'settings':
        return (
          <Section title="Settings">
            <Stack gap="0.5rem">
              <p>Settings customization is on the way.</p>
              <p>We will add profile and theme controls in a future update.</p>
            </Stack>
          </Section>
        )
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
