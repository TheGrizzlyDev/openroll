import React, { type ChangeEvent } from 'react'
import { useGameContext } from '../GameContext'
import Overlay from './Overlay'

export default function CharacterSelect() {
  const {
    characters,
    loadCharacter,
    deleteCharacter,
    createCharacter,
    exportCharacters,
    importCharacters,
    overlay,
    setOverlay,
    overlayTimeout
  } = useGameContext()

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

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ({ target }: ProgressEvent<FileReader>) => {
      const data = target?.result as string
      const success = importCharacters(data)
      if (!success) {
        setOverlay({ message: 'Failed to import characters', visible: true })
      } else {
        let count = 0
        try {
          const parsed = JSON.parse(data)
          count = Array.isArray(parsed) ? parsed.length : 0
        } catch {
          count = 0
        }
        setOverlay({
          message: `${count} character${count === 1 ? '' : 's'} imported`,
          visible: true
        })
      }
      if (overlayTimeout.current) clearTimeout(overlayTimeout.current)
      overlayTimeout.current = setTimeout(
        () => setOverlay(prev => ({ ...prev, visible: false })),
        10000
      )
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const confirmDelete = (idx: number) =>
    window.confirm('Delete this character?') && deleteCharacter(idx)
  return (
    <div className="container start-screen">
      <h1>Open Roll</h1>
      <ul className="character-list">
        {characters.map((c, idx) => (
          <li key={idx}>
            <button onClick={() => loadCharacter(idx)}>{c.name || `Character ${idx + 1}`}</button>
            <button onClick={() => confirmDelete(idx)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={createCharacter}>Create New</button>
      <button onClick={handleExport}>Export</button>
      <input type="file" accept="application/json" onChange={handleImport} />
      <Overlay
        message={overlay.message}
        visible={overlay.visible}
        onClose={() => {
          if (overlayTimeout.current) clearTimeout(overlayTimeout.current)
          setOverlay(prev => ({ ...prev, visible: false }))
        }}
      />
    </div>
  )
}
