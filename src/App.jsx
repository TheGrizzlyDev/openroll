import { useEffect, useRef, useState } from 'react'
import { DiceRoller as DiceParser } from '@dice-roller/rpg-dice-roller'
import DiceRoller from './DiceRoller'
import Inventory from './Inventory'
import CharacterSelect from './components/CharacterSelect'
import CharacterSheet from './components/CharacterSheet'
import LogView from './components/LogView'
import Overlay from './components/Overlay'
import './App.css'

const createSheet = () => ({
  name: '',
  class: '',
  str: 0,
  agi: 0,
  pre: 0,
  tou: 0,
  statDice: {
    str: '1d20',
    agi: '1d20',
    pre: '1d20',
    tou: '1d20'
  },
  hp: 0,
  maxHp: 0,
  armor: 0,
  omens: 0,
  silver: 0,
  notes: ''
})

export default function App() {
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('characters')
    return saved ? JSON.parse(saved) : []
  })
  const [current, setCurrent] = useState(null)
  const [sheet, setSheet] = useState(() => createSheet())
  const [inventory, setInventory] = useState([])
  const [log, setLog] = useState(() => {
    const saved = localStorage.getItem('log')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTab, setActiveTab] = useState('character')
  const [overlay, setOverlay] = useState({ message: '', visible: false })
  const overlayTimeout = useRef(null)

  const skipSave = useRef(false)

  useEffect(() => {
    if (skipSave.current) return
    localStorage.setItem('characters', JSON.stringify(characters))
  }, [characters])

  useEffect(() => {
    if (skipSave.current) return
    localStorage.setItem('log', JSON.stringify(log))
  }, [log])

  useEffect(() => {
    if (current === null) return
    setCharacters(prev => {
      const updated = [...prev]
      const existing = updated[current] || { name: '', sheet: createSheet(), inventory: [] }
      updated[current] = { ...existing, name: sheet.name, sheet, inventory }
      return updated
    })
  }, [sheet, inventory, current])

  const loadCharacter = (idx) => {
    const char = characters[idx]
    if (!char) return
    setCurrent(idx)
    setSheet(char.sheet || createSheet())
    setInventory(char.inventory || [])
  }

  const createCharacter = () => {
    const newChar = { name: '', sheet: createSheet(), inventory: [] }
    const index = characters.length
    setCharacters(prev => [...prev, newChar])
    setCurrent(index)
    setSheet(newChar.sheet)
    setInventory(newChar.inventory)
  }

  const deleteCharacter = (idx) => {
    setCharacters(prev => prev.filter((_, i) => i !== idx))
  }

  const roller = new DiceParser()

  const roll = (notation, label = '') => {
    const result = roller.roll(notation)
    const entry = { label, notation, output: result.output, total: result.total }
    setLog(prev => [entry, ...prev])
    const message = `${label ? `${label}: ` : ''}${result.output}`
    setOverlay({ message, visible: true })
    clearTimeout(overlayTimeout.current)
    overlayTimeout.current = setTimeout(() => setOverlay(prev => ({ ...prev, visible: false })), 10000)
    return result.total
  }

  const logInventory = (message) => {
    setLog(prev => [{ label: 'Inventory', output: message }, ...prev])
  }

  if (current === null) {
    return (
      <CharacterSelect
        characters={characters}
        onLoad={loadCharacter}
        onDelete={deleteCharacter}
        onCreate={createCharacter}
      />
    )
  }

  return (
    <div className="container">
      <h1>Open Roll</h1>
      <button onClick={() => setCurrent(null)}>Characters</button>
      <DiceRoller onRoll={roll} />

      <div className="tabs">
        <button
          className={activeTab === 'character' ? 'active' : ''}
          onClick={() => setActiveTab('character')}
        >
          Character
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={activeTab === 'log' ? 'active' : ''}
          onClick={() => setActiveTab('log')}
        >
          Log
        </button>
      </div>

      {activeTab === 'character' && (
        <CharacterSheet sheet={sheet} setSheet={setSheet} onRoll={roll} />
      )}

      {activeTab === 'inventory' && (
        <Inventory items={inventory} onChange={setInventory} onLog={logInventory} />
      )}

      {activeTab === 'log' && <LogView log={log} />}

      <Overlay
        message={overlay.message}
        visible={overlay.visible}
        onClose={() => {
          clearTimeout(overlayTimeout.current)
          setOverlay(prev => ({ ...prev, visible: false }))
        }}
      />
    </div>
  )
}
