import React from 'react'
import { useGameContext } from '../GameContext'

export default function LogView() {
  const { log } = useGameContext()
  return (
    <div className="log">
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
