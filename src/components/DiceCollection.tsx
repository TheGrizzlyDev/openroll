import { Button } from '../ui'
import { useTheme } from '../theme/ThemeProvider'
import { useDiceStore, type Die } from '../diceStore'

function DieItem({ die, onEdit, onDelete }: { die: Die; onEdit: () => void; onDelete: () => void }) {
  const { icons } = useTheme()
  return (
    <div className="die-item">
      <span className="die-preview">{icons.dice}</span>
      <span className="die-name">{die.name}</span>
      <div className="die-actions">
        <Button icon="edit" onClick={onEdit}>
          Edit
        </Button>
        <Button onClick={onDelete}>Delete</Button>
      </div>
    </div>
  )
}

export default function DiceCollection() {
  const dice = useDiceStore(state => state.dice)
  const addDie = useDiceStore(state => state.addDie)
  const updateDie = useDiceStore(state => state.updateDie)
  const removeDie = useDiceStore(state => state.removeDie)

  const handleEdit = (die: Die) => {
    const name = window.prompt('Die name', die.name)
    if (name && name !== die.name) {
      updateDie(die.id, { name })
    }
  }

  return (
    <div className="dice-collection">
      {dice.map(die => (
        <DieItem
          key={die.id}
          die={die}
          onEdit={() => handleEdit(die)}
          onDelete={() => removeDie(die.id)}
        />
      ))}
      <Button onClick={addDie}>New Die</Button>
    </div>
  )
}
