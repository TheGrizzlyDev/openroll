import React from 'react'
import { useGameContext } from '../GameContext'

export default function CharacterSelect() {
  const { characters, loadCharacter, deleteCharacter, createCharacter } = useGameContext()
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
    </div>
  )
}
