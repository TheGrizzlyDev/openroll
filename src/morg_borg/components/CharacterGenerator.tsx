import { useGameContext } from '../../GameContext'
import type { InventoryItem } from '../generateCharacter'

export default function CharacterGenerator() {
  const {
    state: { sheet, inventory },
    createCharacter,
    finalizeCharacter,
    cancelCreation
  } = useGameContext()

  return (
    <div className="container start-screen">
      <h1>Character Generator</h1>
      <div className="generated-results">
        <p>STR: {sheet.str}, AGI: {sheet.agi}, PRE: {sheet.pre}, TGH: {sheet.tou}</p>
        <p>HP: {sheet.hp}</p>
        <p>Omens: {sheet.omens}</p>
        <p>Silver: {sheet.silver}</p>
        <h3>Inventory</h3>
        <ul>
          {inventory.map((item: InventoryItem) => (
            <li key={item.id}>{item.name}{item.notes ? ` (${item.notes})` : ''}</li>
          ))}
        </ul>
      </div>
      <div className="actions">
        <button onClick={createCharacter}>Reroll</button>
        <button onClick={finalizeCharacter}>Confirm</button>
        <button onClick={cancelCreation}>Cancel</button>
      </div>
    </div>
  )
}
