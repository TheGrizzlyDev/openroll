/* eslint react-refresh/only-export-components: off */
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction
} from 'react'
import { DiceRoller as DiceParser, type DiceRoll } from '@dice-roller/rpg-dice-roller'
import { useNavigate, useLocation } from 'react-router-dom'
import { createSheet, type Sheet } from './morg_borg/sheet'
import { generateCharacter } from './morg_borg/generateCharacter'
import type { MutableRefObject } from 'react'

export interface InventoryItem {
  id: number
  name: string
  qty: number
  notes: string
}

export interface Scroll {
  id: number
  type: 'unclean' | 'sacred'
  name: string
  casts: number
  notes: string
}

export interface LogEntry {
  label: string
  notation?: string
  output: string
  total?: number
}

export interface Character {
  name: string
  sheet: Sheet
  inventory: InventoryItem[]
  scrolls: Scroll[]
}

export interface OverlayState {
  message: string
  visible: boolean
}

export interface GameContextValue {
  characters: Character[]
  setCharacters: Dispatch<SetStateAction<Character[]>>
  current: number | null
  setCurrent: Dispatch<SetStateAction<number | null>>
  sheet: Sheet
  setSheet: Dispatch<SetStateAction<Sheet>>
  inventory: InventoryItem[]
  setInventory: Dispatch<SetStateAction<InventoryItem[]>>
  scrolls: Scroll[]
  setScrolls: Dispatch<SetStateAction<Scroll[]>>
  log: LogEntry[]
  setLog: Dispatch<SetStateAction<LogEntry[]>>
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
  overlay: OverlayState
  setOverlay: Dispatch<SetStateAction<OverlayState>>
  overlayTimeout: MutableRefObject<ReturnType<typeof setTimeout> | null>
  loadCharacter: (_idx: number, _opts?: { navigate?: boolean }) => void
  createCharacter: () => void
  finalizeCharacter: () => void
  cancelCreation: () => void
  deleteCharacter: (_idx: number) => void
  exportCharacters: () => string
  importCharacters: (_data: unknown) => boolean
  roll: (_notation: string, _label?: string) => number
  logInventory: (_message: string) => void
}

export const GameContext = createContext<GameContextValue | null>(null)
export const useGameContext = () => useContext(GameContext) as GameContextValue

export function GameProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('characters')
    return saved ? JSON.parse(saved) : []
  })
  const [current, setCurrent] = useState<number | null>(null)
  const [sheet, setSheet] = useState<Sheet>(() => createSheet())
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [scrolls, setScrolls] = useState<Scroll[]>([])
  const [log, setLog] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('log')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTab, setActiveTab] = useState<string>('character')
  const [overlay, setOverlay] = useState<OverlayState>({ message: '', visible: false })
  const overlayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const skipSave = useRef<boolean>(false)
  const charactersRef = useRef<Character[]>(characters)

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
    skipSave.current = true
    const { sheet: newSheet, inventory: newInv } = generateCharacter()
    const index = characters.length
    setSheet(newSheet)
    setInventory(newInv)
    setScrolls([])
    setCurrent(index)
    navigate('/generator')
  }

  const finalizeCharacter = () => {
    const index = current ?? characters.length
    setCharacters(prev => {
      const updated = [...prev]
      updated[index] = { name: '', sheet, inventory, scrolls }
      return updated
    })
    skipSave.current = false
    navigate(`/sheet/${index}`)
  }

  const cancelCreation = () => {
    skipSave.current = false
    setCurrent(null)
    navigate('/characters')
  }

  const deleteCharacter = (idx: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== idx))
    setCurrent(null)
    navigate('/characters')
  }

  const exportCharacters = () => JSON.stringify(characters, null, 2)

  const importCharacters = (data: unknown) => {
    let parsed: unknown
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return false
    }
    if (!Array.isArray(parsed)) return false
    const sanitized = parsed.map(c => {
      const name = typeof (c as Character).name === 'string' ? (c as Character).name : ''
      const sheet =
        typeof (c as Character).sheet === 'object'
          ? { ...createSheet(), ...(c as Character).sheet }
          : createSheet()
      const inventory = Array.isArray((c as Character).inventory) ? (c as Character).inventory : []
      const scrolls = Array.isArray((c as Character).scrolls) ? (c as Character).scrolls : []
      return { name, sheet, inventory, scrolls }
    })
    setCharacters(prev => [...prev, ...sanitized])
    return true
  }

  const roller = new DiceParser()

  const roll = (notation: string, label = '') => {
    const result = roller.roll(notation) as DiceRoll
    const entry: LogEntry = { label, notation, output: result.output, total: result.total }
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
    finalizeCharacter,
    cancelCreation,
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
