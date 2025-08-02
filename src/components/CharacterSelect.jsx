import React from 'react'

export default function CharacterSelect({ characters, onLoad, onDelete, onCreate }) {
  return (
    <div className="container start-screen">
      <h1>Open Roll</h1>
      <ul className="character-list">
        {characters.map((c, idx) => (
          <li key={idx}>
            <button onClick={() => onLoad(idx)}>{c.name || `Character ${idx + 1}`}</button>
            <button onClick={() => onDelete(idx)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={onCreate}>Create New</button>
    </div>
  )
}
