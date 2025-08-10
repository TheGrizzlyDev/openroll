import { FormField, Input } from '../../design-system'
import { useGameContext } from '../../GameContext'

export default function GameSettings() {
  const {
    state: { diceStyle },
    setDiceStyle
  } = useGameContext()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Dice color" htmlFor="dice-color">
        <Input
          id="dice-color"
          type="color"
          value={diceStyle.color}
          onChange={e => setDiceStyle({ ...diceStyle, color: e.target.value })}
        />
      </FormField>
    </div>
  )
}
