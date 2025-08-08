import { ChangeEvent } from 'react'
import { useGameContext } from '../GameContext'
import { Input, FormField } from '../design-system'

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
      <FormField label="Dice Color" htmlFor="dice-color">
        <Input id="dice-color" type="color" value={diceStyle.color} onChange={handleColor} />
      </FormField>
      <FormField label="Edge Color" htmlFor="edge-color">
        <Input id="edge-color" type="color" value={diceStyle.edgeColor} onChange={handleEdgeColor} />
      </FormField>
      <FormField label="Texture URLs" htmlFor="texture-urls">
        <Input
          id="texture-urls"
          type="text"
          value={diceStyle.textureUrls.join(',')}
          onChange={handleTextures}
          placeholder="comma-separated URLs"
        />
      </FormField>
    </div>
  )
}
