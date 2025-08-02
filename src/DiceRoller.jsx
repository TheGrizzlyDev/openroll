import { useState } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'

export default function DiceRoller({ onRoll }) {
  const [notation, setNotation] = useState('1d20')
  const [error, setError] = useState('')

  const handleRoll = () => {
    try {
      Parser.parse(notation)
      onRoll(notation)
      setError('')
    } catch {
      setError('Invalid notation')
    }
  }

  return (
    <div className="dice-roller">
      <input
        type="text"
        value={notation}
        onChange={e => {
          setNotation(e.target.value)
          setError('')
        }}
        placeholder="1d20"
        className={error ? 'error' : ''}
      />
      <button onClick={handleRoll}>Roll</button>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
