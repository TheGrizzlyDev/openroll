import React from 'react'
import { useGameContext } from '../GameContext'

export default function LogView() {
  const { log } = useGameContext()
  return (
    <div className="log">
      <h2>Rolls</h2>
      <ul>
        {log.map((entry: any, idx: number) => (
          <li key={idx}>
            {entry.label ? `${entry.label}: ` : ''}
            {entry.output}
          </li>
        ))}
      </ul>
    </div>
  )
}
