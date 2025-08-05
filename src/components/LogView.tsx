import React from 'react'
import { useGameContext } from '../GameContext'

export default function LogView() {
  const { log, setLog } = useGameContext()
  return (
    <div className="log">
      <button onClick={() => setLog([])}>Clear Log</button>
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
