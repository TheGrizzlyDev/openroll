import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from './GameContext'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

export default function DiceRoller() {
  const { roll } = useGameContext()
  const [notation, setNotation] = useState('1d20')
  const [error, setError] = useState('')

  const handleRoll = () => {
    try {
      Parser.parse(notation)
      roll(notation)
      setError('')
    } catch {
      setError('Invalid notation')
    }
  }

  return (
    <div className="dice-roller">
      <Input
        type="text"
        value={notation}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNotation(e.target.value)
          setError('')
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleRoll()
          }
        }}
        placeholder="1d20"
        className={error ? 'error' : undefined}
      />
      <Button icon="roll" onClick={handleRoll}>Roll</Button>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
