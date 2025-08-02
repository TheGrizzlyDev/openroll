import { useState } from 'react'

export default function DiceRoller({ onRoll }) {
  const [count, setCount] = useState(1)
  const [sides, setSides] = useState(20)
  const [mod, setMod] = useState(0)

  const handleRoll = () => {
    onRoll(Number(count), Number(sides), Number(mod), `${count}d${sides}${mod ? (mod > 0 ? `+${mod}` : mod) : ''}`)
  }

  return (
    <div className="dice-roller">
      <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} />
      <span>d</span>
      <input type="number" min="2" value={sides} onChange={e => setSides(e.target.value)} />
      <span>+</span>
      <input type="number" value={mod} onChange={e => setMod(e.target.value)} />
      <button onClick={handleRoll}>Roll</button>
    </div>
  )
}
