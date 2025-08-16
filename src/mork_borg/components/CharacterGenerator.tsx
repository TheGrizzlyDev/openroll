import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { useGameContext } from '../../stores/GameContext'
import { Select, Button } from '../../components/ui'
import { PageContainer, Section } from '../../layout'
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
    navigate('/')
  }

  const handleClassChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    createCharacter(value || undefined)
  }

  const handleRollClass = () => {
    createCharacter()
  }

  return (
    <PageContainer title="Character Generator">
      <Section
        title="Class"
        actions={<Button onClick={handleRollClass}>Roll Class</Button>}
      >
        <label>
          Class
          <Select value={sheet.class} onChange={handleClassChange}>
            <option value="">Random</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </Select>
        </label>
      </Section>
      <Section title="Results">
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
      </Section>
      <Section
        title="Finalize"
        actions={
          <>
            <Button onClick={() => createCharacter(sheet.class || undefined)}>
              Reroll
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </>
        }
      />
    </PageContainer>
  )
}
