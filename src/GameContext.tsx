/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { DiceRoller as DiceParser } from '@dice-roller/rpg-dice-roller'
import { useNavigate, useLocation } from 'react-router-dom'
import { createSheet } from './morg_borg/sheet'

export const GameContext = createContext<any>(null)
export const useGameContext = () => useContext(GameContext)

export function GameProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<any[]>(() => {
    const saved = localStorage.getItem('characters')
    return saved ? JSON.parse(saved) : []
  })
  const [current, setCurrent] = useState<number | null>(null)
  const [sheet, setSheet] = useState<any>(() => createSheet())
  const [inventory, setInventory] = useState<any[]>([])
  const [scrolls, setScrolls] = useState<any[]>([])
  const [log, setLog] = useState<any[]>(() => {
    const saved = localStorage.getItem('log')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTab, setActiveTab] = useState<string>('character')
  const [overlay, setOverlay] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })
  const overlayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const skipSave = useRef<boolean>(false)
  const charactersRef = useRef<any[]>(characters)

  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

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
    if (skipSave.current) return
    setCharacters(prev => {
      const updated = [...prev]
      const existing = updated[current] || { name: '', sheet: createSheet(), inventory: [], scrolls: [] }
      updated[current] = { ...existing, name: sheet.name, sheet, inventory, scrolls }
      return updated
    })
  }, [sheet, inventory, scrolls, current])

  const navigate = useNavigate()
  const location = useLocation()

  const loadCharacter = useCallback((idx: number, { navigate: doNavigate = true }: { navigate?: boolean } = {}) => {
    const char = charactersRef.current[idx]
    if (!char) return
    skipSave.current = true
    setCurrent(idx)
    setSheet(char.sheet || createSheet())
    setInventory(char.inventory || [])
    setScrolls(char.scrolls || [])
    if (doNavigate) navigate(`/sheet/${idx}`)
    setTimeout(() => {
      skipSave.current = false
    })
  }, [navigate])

  const createCharacter = () => {
    const newChar = { name: '', sheet: createSheet(), inventory: [], scrolls: [] }
    const index = characters.length
    setCharacters(prev => [...prev, newChar])
    setSheet(newChar.sheet)
    setInventory(newChar.inventory)
    setScrolls(newChar.scrolls)
    setCurrent(index)
    navigate(`/sheet/${index}`)
  }

  const deleteCharacter = (idx: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== idx))
    setCurrent(null)
    navigate('/characters')
  }

  const exportCharacters = () => JSON.stringify(characters, null, 2)

  const importCharacters = (data: any) => {
    let parsed: any
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return false
    }
    if (!Array.isArray(parsed)) return false
    const sanitized = parsed.map(c => {
      const name = typeof c.name === 'string' ? c.name : ''
      const sheet = typeof c.sheet === 'object' ? { ...createSheet(), ...c.sheet } : createSheet()
      const inventory = Array.isArray(c.inventory) ? c.inventory : []
      const scrolls = Array.isArray(c.scrolls) ? c.scrolls : []
      return { name, sheet, inventory, scrolls }
    })
    setCharacters(prev => [...prev, ...sanitized])
    return true
  }

  const roller = new DiceParser()

  const roll = (notation: string, label = '') => {
    const result = roller.roll(notation) as any
    const entry = { label, notation, output: result.output, total: result.total }
    setLog(prev => [entry, ...prev])
    const message = `${label ? `${label}: ` : ''}${result.output}`
    setOverlay({ message, visible: true })
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current)
    overlayTimeout.current = setTimeout(() => setOverlay(prev => ({ ...prev, visible: false })), 10000)
    return result.total as number
  }

  const logInventory = (message: string) => {
    setLog(prev => [{ label: 'Inventory', output: message }, ...prev])
  }

  useEffect(() => {
    if (location.pathname === '/characters') {
      setCurrent(null)
    }
  }, [location.pathname])

  const value = {
    characters,
    setCharacters,
    current,
    setCurrent,
    sheet,
    setSheet,
    inventory,
    setInventory,
    scrolls,
    setScrolls,
    log,
    setLog,
    activeTab,
    setActiveTab,
    overlay,
    setOverlay,
    overlayTimeout,
    loadCharacter,
    createCharacter,
    deleteCharacter,
    exportCharacters,
    importCharacters,
    roll,
    logInventory
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}
