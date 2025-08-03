import React from 'react'
import { useGameContext } from '../GameContext'

export default function CharacterSelect() {
  const {
    characters,
    loadCharacter,
    deleteCharacter,
    createCharacter,
    exportCharacters,
    importCharacters
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

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ({ target }) => {
      importCharacters(target.result)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="container start-screen">
      <h1>Open Roll</h1>
      <ul className="character-list">
        {characters.map((c, idx) => (
          <li key={idx}>
            <button onClick={() => loadCharacter(idx)}>{c.name || `Character ${idx + 1}`}</button>
            <button onClick={() => deleteCharacter(idx)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={createCharacter}>Create New</button>
      <button onClick={handleExport}>Export</button>
      <input type="file" accept="application/json" onChange={handleImport} />
    </div>
  )
}
