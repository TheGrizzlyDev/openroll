import React from 'react'

export default function LogView({ log }) {
  return (
    <div className="log">
      <h2>Rolls</h2>
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
