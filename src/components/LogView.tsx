import React from 'react'
import { useGameContext } from '../GameContext'
import { Button } from '../ui'

export default function LogView() {
  const {
    state: { log },
    dispatch
  } = useGameContext()
  return (
    <div className="log">
      <Button onClick={() => dispatch({ type: 'SET_LOG', log: [] })}>
        Clear Log
      </Button>
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
