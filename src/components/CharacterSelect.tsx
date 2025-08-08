import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../GameContext'
import Popup from './Popup'
import { FileInput } from './FileInput'
import { Button } from '../design-system'
import DiceStyleSelector from './DiceStyleSelector'

export default function CharacterSelect() {
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
  return (
    <div className="container start-screen">
      <h1>Open Roll</h1>
      <ul className="character-list">
        {characters.map((c, idx) => (
          <li key={idx}>
            <Button onClick={() => handleLoad(idx)}>{c.name || `Character ${idx + 1}`}</Button>
            <Button onClick={() => confirmDelete(idx)}>Delete</Button>
          </li>
        ))}
      </ul>
      <Button onClick={handleCreate}>Create New</Button>
      <Button onClick={handleExport}>Export</Button>
      <FileInput accept="application/json" onFileSelect={handleImport}>Import</FileInput>
      <DiceStyleSelector />
      {overlay.visible && (
        <Popup
          visible={overlay.visible}
          onClose={() => {
            if (overlayTimeout) clearTimeout(overlayTimeout)
            setOverlayTimeout(null)
            dispatch({ type: 'SET_OVERLAY', overlay: { ...overlay, visible: false } })
          }}
        >
          <span>{overlay.message}</span>
        </Popup>
      )}
    </div>
  )
}
