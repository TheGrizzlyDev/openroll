import React from 'react'
import { useGameContext } from '../GameContext'

export default function LogView() {
  const {
    state: { log },
    dispatch
  } = useGameContext()
  return (
    <div className="log">
      <button className="base-button" onClick={() => dispatch({ type: 'SET_LOG', log: [] })}>
        Clear Log
      </button>
      <ul>
        {log.map((entry, idx) => (
          <li key={idx}>
            {entry.label ? `${entry.label}: ` : ''}
            {entry.output}
          </li>
        ))}
      </ul>
    </div>
  )
}
