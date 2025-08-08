import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { useGameContext } from '../../GameContext'
import { Select } from '../../ui/Select'
import { Button } from '../../ui'
import classes from '../classes'
import type { InventoryItem, Scroll } from '../generateCharacter'

export default function CharacterGenerator() {
  const {
    state: { sheet, inventory, scrolls },
    createCharacter,
    finalizeCharacter,
    cancelCreation
  } = useGameContext()
  const navigate = useNavigate()

  const handleConfirm = () => {
    const index = finalizeCharacter()
    navigate(`/sheet/${index}`)
  }

  const handleCancel = () => {
    cancelCreation()
    navigate('/characters')
  }

  const handleClassChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    createCharacter(value || undefined)
  }

  const handleRollClass = () => {
    createCharacter()
  }

  return (
    <div className="container start-screen">
      <h1>Character Generator</h1>
      <div className="class-select">
        <label>
          Class
          <Select
            value={sheet.class}
            onChange={handleClassChange}
          >
            <option value="">Random</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </Select>
        </label>
        <Button onClick={handleRollClass}>Roll Class</Button>
      </div>
      <div className="generated-results">
        <p>Class: {sheet.class}</p>
        <p>STR: {sheet.str}, AGI: {sheet.agi}, PRE: {sheet.pre}, TGH: {sheet.tou}</p>
        <p>HP: {sheet.hp}</p>
        <p>Omens: {sheet.omens}</p>
        <p>Silver: {sheet.silver}</p>
        <p>Trait: {sheet.trait}</p>
        <p>Background: {sheet.background}</p>
        {sheet.notes && (
          <>
            <h3>Abilities</h3>
            <ul>
              {sheet.notes.split('\n').map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </>
        )}
        <h3>Inventory</h3>
        <ul>
          {inventory.map((item: InventoryItem) => (
            <li key={item.id}>
              {item.name}
              {item.qty > 1 ? ` x${item.qty}` : ''}
              {item.notes ? ` (${item.notes})` : ''}
            </li>
          ))}
        </ul>
        {scrolls.length > 0 && (
          <>
            <h3>Scrolls</h3>
            <ul>
              {scrolls.map((scroll: Scroll) => (
                <li key={scroll.id}>
                  {scroll.name} [{scroll.type}] ({scroll.casts})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="actions">
        <Button onClick={() => createCharacter(sheet.class || undefined)}>
          Reroll
        </Button>
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button onClick={handleCancel}>Cancel</Button>
      </div>
    </div>
  )
}
