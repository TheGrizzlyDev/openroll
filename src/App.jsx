import { useEffect, useRef, useState } from 'react'
import { DiceRoller as DiceParser } from '@dice-roller/rpg-dice-roller'
import { useNavigate, useLocation } from 'react-router-dom'
import AppRoutes from './routes'
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

  const navigate = useNavigate()
  const location = useLocation()

  const loadCharacter = (idx, { navigate: doNavigate = true } = {}) => {
    const char = characters[idx]
    if (!char) return
    setCurrent(idx)
    setSheet(char.sheet || createSheet())
    setInventory(char.inventory || [])
    if (doNavigate) navigate(`/sheet/${idx}`)
  }

  const createCharacter = () => {
    const newChar = { name: '', sheet: createSheet(), inventory: [] }
    const index = characters.length
    setCharacters(prev => [...prev, newChar])
    setSheet(newChar.sheet)
    setInventory(newChar.inventory)
    setCurrent(index)
    navigate(`/sheet/${index}`)
  }

  const deleteCharacter = (idx) => {
    setCharacters(prev => prev.filter((_, i) => i !== idx))
    setCurrent(null)
    navigate('/characters')
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

  useEffect(() => {
    if (location.pathname === '/characters') {
      setCurrent(null)
    }
  }, [location.pathname])

  return (
    <AppRoutes
      characters={characters}
      loadCharacter={loadCharacter}
      createCharacter={createCharacter}
      deleteCharacter={deleteCharacter}
      sheet={sheet}
      setSheet={setSheet}
      inventory={inventory}
      setInventory={setInventory}
      log={log}
      logInventory={logInventory}
      roll={roll}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      overlay={overlay}
      setOverlay={setOverlay}
      overlayTimeout={overlayTimeout}
    />
  )
}
