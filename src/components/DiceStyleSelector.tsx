import { ChangeEvent } from 'react'
import { useGameContext } from '../GameContext'
import { Input } from '../design-system'

export default function DiceStyleSelector() {
  const {
    state: { diceStyle },
    setDiceStyle
  } = useGameContext()

  const handleColor = (e: ChangeEvent<HTMLInputElement>) =>
    setDiceStyle({ ...diceStyle, color: e.target.value })

  const handleEdgeColor = (e: ChangeEvent<HTMLInputElement>) =>
    setDiceStyle({ ...diceStyle, edgeColor: e.target.value })

  const handleTextures = (e: ChangeEvent<HTMLInputElement>) =>
    setDiceStyle({
      ...diceStyle,
      textureUrls: e.target.value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    })

  return (
    <div className="dice-style-selector">
      <label>
        Dice Color
        <input type="color" value={diceStyle.color} onChange={handleColor} />
      </label>
      <label>
        Edge Color
        <input type="color" value={diceStyle.edgeColor} onChange={handleEdgeColor} />
      </label>
      <label>
        Texture URLs
        <Input
          type="text"
          value={diceStyle.textureUrls.join(',')}
          onChange={handleTextures}
          placeholder="comma-separated URLs"
        />
      </label>
    </div>
  )
}
