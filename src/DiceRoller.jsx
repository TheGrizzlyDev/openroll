import { useState } from 'react'

export default function DiceRoller({ onRoll }) {
  const [notation, setNotation] = useState('1d20')

  const handleRoll = () => {
    onRoll(notation)
  }

  return (
    <div className="dice-roller">
      <input
        type="text"
        value={notation}
        onChange={e => setNotation(e.target.value)}
        placeholder="1d20"
      />
      <button onClick={handleRoll}>Roll</button>
    </div>
  )
}
