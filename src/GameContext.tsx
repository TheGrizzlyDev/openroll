/* eslint react-refresh/only-export-components: off */
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useReducer,
  type ReactNode,
  type Dispatch
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

export interface GameState {
  characters: Character[]
  current: number | null
  sheet: Sheet
  inventory: InventoryItem[]
  scrolls: Scroll[]
  log: LogEntry[]
  activeTab: string
  overlay: OverlayState
}

export type GameAction =
  | { type: 'SET_CHARACTERS'; characters: Character[] }
  | { type: 'SET_CURRENT'; current: number | null }
  | { type: 'SET_SHEET'; sheet: Sheet }
  | { type: 'SET_INVENTORY'; inventory: InventoryItem[] }
  | { type: 'SET_SCROLLS'; scrolls: Scroll[] }
  | { type: 'ADD_LOG'; entry: LogEntry }
  | { type: 'SET_LOG'; log: LogEntry[] }
  | { type: 'SET_ACTIVE_TAB'; tab: string }
  | { type: 'SET_OVERLAY'; overlay: OverlayState }

export interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  overlayTimeout: MutableRefObject<ReturnType<typeof setTimeout> | null>
  loadCharacter: (_idx: number, _opts?: { navigate?: boolean }) => void
  createCharacter: (_class?: string) => void
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
  const initialState: GameState = {
    characters: (() => {
      const saved = localStorage.getItem('characters')
      return saved ? JSON.parse(saved) : []
    })(),
    current: null,
    sheet: createSheet(),
    inventory: [],
    scrolls: [],
    log: (() => {
      const saved = localStorage.getItem('log')
      return saved ? JSON.parse(saved) : []
    })(),
    activeTab: 'character',
    overlay: { message: '', visible: false }
  }

  const reducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
      case 'SET_CHARACTERS':
        return { ...state, characters: action.characters }
      case 'SET_CURRENT':
        return { ...state, current: action.current }
      case 'SET_SHEET':
        return { ...state, sheet: action.sheet }
      case 'SET_INVENTORY':
        return { ...state, inventory: action.inventory }
      case 'SET_SCROLLS':
        return { ...state, scrolls: action.scrolls }
      case 'ADD_LOG':
        return { ...state, log: [action.entry, ...state.log] }
      case 'SET_LOG':
        return { ...state, log: action.log }
      case 'SET_ACTIVE_TAB':
        return { ...state, activeTab: action.tab }
      case 'SET_OVERLAY':
        return { ...state, overlay: action.overlay }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  const overlayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const skipSave = useRef<boolean>(false)
  const charactersRef = useRef<Character[]>(state.characters)

  useEffect(() => {
    charactersRef.current = state.characters
  }, [state.characters])

  useEffect(() => {
    if (skipSave.current) return
    localStorage.setItem('characters', JSON.stringify(state.characters))
  }, [state.characters])

  useEffect(() => {
    if (skipSave.current) return
    localStorage.setItem('log', JSON.stringify(state.log))
  }, [state.log])

  const { sheet, inventory, scrolls, current } = state

  useEffect(() => {
    if (current === null) return
    if (skipSave.current) return
    const updated = [...charactersRef.current]
    const existing =
      updated[current] || { name: '', sheet: createSheet(), inventory: [], scrolls: [] }
    updated[current] = {
      ...existing,
      name: sheet.name,
      sheet,
      inventory,
      scrolls
    }
    dispatch({ type: 'SET_CHARACTERS', characters: updated })
  }, [sheet, inventory, scrolls, current])

  const navigate = useNavigate()
  const location = useLocation()

  const loadCharacter = useCallback(
    (idx: number, { navigate: doNavigate = true }: { navigate?: boolean } = {}) => {
      const char = charactersRef.current[idx]
      if (!char) return
      skipSave.current = true
      dispatch({ type: 'SET_CURRENT', current: idx })
      dispatch({ type: 'SET_SHEET', sheet: char.sheet || createSheet() })
      dispatch({ type: 'SET_INVENTORY', inventory: char.inventory || [] })
      dispatch({ type: 'SET_SCROLLS', scrolls: char.scrolls || [] })
      if (doNavigate) navigate(`/sheet/${idx}`)
      setTimeout(() => {
        skipSave.current = false
      })
    },
    [navigate]
  )

  const createCharacter = (cls?: string) => {
    skipSave.current = true
    const {
      sheet: newSheet,
      inventory: newInv,
      scrolls: newScrolls
    } = generateCharacter(cls)
    const index = state.characters.length
    dispatch({ type: 'SET_SHEET', sheet: newSheet })
    dispatch({ type: 'SET_INVENTORY', inventory: newInv })
    dispatch({ type: 'SET_SCROLLS', scrolls: newScrolls })
    dispatch({ type: 'SET_CURRENT', current: index })
    navigate('/generator')
  }

  const finalizeCharacter = () => {
    const index = state.current ?? state.characters.length
    const updated = [...state.characters]
    updated[index] = {
      name: '',
      sheet: state.sheet,
      inventory: state.inventory,
      scrolls: state.scrolls
    }
    dispatch({ type: 'SET_CHARACTERS', characters: updated })
    skipSave.current = false
    navigate(`/sheet/${index}`)
  }

  const cancelCreation = () => {
    skipSave.current = false
    dispatch({ type: 'SET_CURRENT', current: null })
    navigate('/characters')
  }

  const deleteCharacter = (idx: number) => {
    const updated = state.characters.filter((_, i) => i !== idx)
    dispatch({ type: 'SET_CHARACTERS', characters: updated })
    dispatch({ type: 'SET_CURRENT', current: null })
    navigate('/characters')
  }

  const exportCharacters = () => JSON.stringify(state.characters, null, 2)

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
      const inventory = Array.isArray((c as Character).inventory)
        ? (c as Character).inventory
        : []
      const scrolls = Array.isArray((c as Character).scrolls)
        ? (c as Character).scrolls
        : []
      return { name, sheet, inventory, scrolls }
    })
    dispatch({ type: 'SET_CHARACTERS', characters: [...state.characters, ...sanitized] })
    return true
  }

  const roller = new DiceParser()

  const roll = (notation: string, label = '') => {
    const result = roller.roll(notation) as DiceRoll
    const entry: LogEntry = { label, notation, output: result.output, total: result.total }
    dispatch({ type: 'ADD_LOG', entry })
    const message = `${label ? `${label}: ` : ''}${result.output}`
    dispatch({ type: 'SET_OVERLAY', overlay: { message, visible: true } })
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current)
    overlayTimeout.current = setTimeout(
      () => dispatch({ type: 'SET_OVERLAY', overlay: { ...state.overlay, visible: false } }),
      10000
    )
    return result.total as number
  }

  const logInventory = (message: string) => {
    dispatch({ type: 'ADD_LOG', entry: { label: 'Inventory', output: message } })
  }

  useEffect(() => {
    if (location.pathname === '/characters') {
      dispatch({ type: 'SET_CURRENT', current: null })
    }
  }, [location.pathname])

  const value = {
    state,
    dispatch,
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
