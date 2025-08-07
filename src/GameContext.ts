import { create, type StateCreator } from 'zustand'
import { devtools, persist, createJSONStorage, type NamedSet } from 'zustand/middleware'
import { DiceRoller as DiceParser, type DiceRoll } from '@dice-roller/rpg-dice-roller'
import { createSheet, type Sheet } from './morg_borg/sheet'
import { generateCharacter } from './morg_borg/generateCharacter'
import type { ApplyNode } from './oml/parser'

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

export type DiceType = 'd4' | 'd6' | 'd8' | 'd12' | 'd20'

export interface OverlayState {
  message: string
  roll: { type: DiceType; result: number } | null
  visible: boolean
}

export interface DiceStyle {
  color: string
  edgeColor: string
  textureUrls: string[]
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
  diceStyle: DiceStyle
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
  | { type: 'SET_DICE_STYLE'; diceStyle: DiceStyle }

export interface GameContextValue {
  state: GameState
  dispatch: (_action: GameAction) => void
  overlayTimeout: ReturnType<typeof setTimeout> | null
  setOverlayTimeout: (_t: ReturnType<typeof setTimeout> | null) => void
  loadCharacter: (_idx: number) => void
  createCharacter: (_class?: string) => void
  finalizeCharacter: () => number
  cancelCreation: () => void
  deleteCharacter: (_idx: number) => void
  exportCharacters: () => string
  importCharacters: (_data: unknown) => boolean
  roll: (_notation: string, _label?: string) => number
  logInventory: (_message: string) => void
  applyEffect: (_effect: ApplyNode) => number
  setDiceStyle: (_style: DiceStyle) => void
}

const initialState: GameState = {
  characters: [],
  current: null,
  sheet: createSheet(),
  inventory: [],
  scrolls: [],
  log: [],
  activeTab: 'character',
  overlay: { message: '', roll: null, visible: false },
  diceStyle: { color: '#ffffff', edgeColor: '#000000', textureUrls: [] }
}

const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_CHARACTERS':
      return { ...state, characters: action.characters }
    case 'SET_CURRENT':
      return { ...state, current: action.current }
    case 'SET_SHEET': {
      const newState = { ...state, sheet: action.sheet }
      if (state.current !== null) {
        const updated = [...state.characters]
        const existing =
          updated[state.current] || {
            name: '',
            sheet: createSheet(),
            inventory: [],
            scrolls: []
          }
        updated[state.current] = {
          ...existing,
          name: action.sheet.name,
          sheet: action.sheet,
          inventory: state.inventory,
          scrolls: state.scrolls
        }
        newState.characters = updated
      }
      return newState
    }
    case 'SET_INVENTORY': {
      const newState = { ...state, inventory: action.inventory }
      if (state.current !== null) {
        const updated = [...state.characters]
        const existing =
          updated[state.current] || {
            name: '',
            sheet: createSheet(),
            inventory: [],
            scrolls: []
          }
        updated[state.current] = { ...existing, inventory: action.inventory }
        newState.characters = updated
      }
      return newState
    }
    case 'SET_SCROLLS': {
      const newState = { ...state, scrolls: action.scrolls }
      if (state.current !== null) {
        const updated = [...state.characters]
        const existing =
          updated[state.current] || {
            name: '',
            sheet: createSheet(),
            inventory: state.inventory,
            scrolls: []
          }
        updated[state.current] = { ...existing, scrolls: action.scrolls }
        newState.characters = updated
      }
      return newState
    }
    case 'ADD_LOG':
      return { ...state, log: [action.entry, ...state.log] }
    case 'SET_LOG':
      return { ...state, log: action.log }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }
    case 'SET_OVERLAY':
      return { ...state, overlay: action.overlay }
    case 'SET_DICE_STYLE':
      return { ...state, diceStyle: action.diceStyle }
    default:
      return state
  }
}

const storeCreator: StateCreator<
  GameContextValue,
  [],
  [["zustand/devtools", never], ["zustand/persist", unknown]]
> = (set: NamedSet<GameContextValue>, get) => ({
  state: initialState,
  dispatch: (action: GameAction) =>
    set(state => ({ state: reducer(state.state, action) }), false, action.type),
  overlayTimeout: null,
  setOverlayTimeout: t => set({ overlayTimeout: t }, false, 'setOverlayTimeout'),
  loadCharacter: idx => {
    const char = get().state.characters[idx]
    if (!char) return
    set(({ state }) => ({
      state: {
        ...state,
        current: idx,
        sheet: char.sheet || createSheet(),
        inventory: char.inventory || [],
        scrolls: char.scrolls || []
      }
    }), false, 'loadCharacter')
  },
  createCharacter: cls => {
    const { sheet, inventory, scrolls } = generateCharacter(cls)
    const index = get().state.characters.length
    set(({ state }) => ({
      state: {
        ...state,
        sheet,
        inventory,
        scrolls,
        current: index
      }
    }), false, 'createCharacter')
  },
  finalizeCharacter: () => {
    const { state } = get()
    const index = state.current ?? state.characters.length
    const updated = [...state.characters]
    updated[index] = {
      name: '',
      sheet: state.sheet,
      inventory: state.inventory,
      scrolls: state.scrolls
    }
    set({ state: { ...state, characters: updated, current: index } }, false, 'finalizeCharacter')
    return index
  },
  cancelCreation: () =>
    set(({ state }) => ({ state: { ...state, current: null } }), false, 'cancelCreation'),
  deleteCharacter: idx =>
    set(({ state }) => ({
      state: {
        ...state,
        characters: state.characters.filter((_, i) => i !== idx),
        current: null
      }
    }), false, 'deleteCharacter'),
  exportCharacters: () => JSON.stringify(get().state.characters, null, 2),
  importCharacters: data => {
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
    set(({ state }) => ({
      state: { ...state, characters: [...state.characters, ...sanitized] }
    }), false, 'importCharacters')
    return true
  },
  roll: (notation: string, label = '') => {
    const roller = new DiceParser()
    const result = roller.roll(notation) as DiceRoll
    const total = result.total as number
    const entry: LogEntry = { label, notation, output: result.output, total }
    const match = notation.match(/d(4|6|8|12|20)/i)
    const type = match ? (`d${match[1]}` as DiceType) : 'd20'
    const { overlayTimeout } = get()
    if (overlayTimeout) clearTimeout(overlayTimeout)
    const timeout = setTimeout(() => {
      set(({ state }) => ({
        state: { ...state, overlay: { ...state.overlay, visible: false, roll: null } },
        overlayTimeout: null
      }), false, 'hideOverlay')
    }, 10000)
    set(({ state }) => ({
      state: {
        ...state,
        log: [entry, ...state.log],
        overlay: { message: '', roll: { type, result: total }, visible: true }
      },
      overlayTimeout: timeout
    }), false, 'roll')
    return total
  },
  logInventory: message =>
    set(({ state }) => ({
      state: {
        ...state,
        log: [{ label: 'Inventory', output: message }, ...state.log]
      }
    }), false, 'logInventory'),
  applyEffect: effect => {
    const { target, value, subject, description } = effect
    const roller = new DiceParser()
    let amount = 0
    let output = value
    if (target !== 'condition') {
      try {
        const result = roller.roll(value) as DiceRoll
        amount = result.total as number
        output = result.output
      } catch {
        amount = Number(value) || 0
      }
    }
    const label = description || subject || target
    const message = `${label}: ${target === 'condition' ? value : output}`
    const { overlayTimeout } = get()
    if (overlayTimeout) clearTimeout(overlayTimeout)
    const timeout = setTimeout(() => {
      set(({ state }) => ({
        state: { ...state, overlay: { ...state.overlay, visible: false, roll: null } },
        overlayTimeout: null
      }), false, 'hideOverlay')
    }, 10000)
    set(({ state }) => {
      const newState = { ...state }
      if (target === 'hp') {
        newState.sheet = { ...newState.sheet, hp: newState.sheet.hp + amount }
      } else if (['str', 'agi', 'pre', 'tou'].includes(target)) {
        const key = target as 'str' | 'agi' | 'pre' | 'tou'
        newState.sheet = {
          ...newState.sheet,
          [key]: newState.sheet[key] + amount
        }
      } else if (target === 'item' && subject) {
        const items = [...newState.inventory]
        const idx = items.findIndex(i => i.name === subject)
        if (idx !== -1) {
          items[idx] = { ...items[idx], qty: items[idx].qty + amount }
        } else if (amount > 0) {
          items.push({ id: Date.now(), name: subject, qty: amount, notes: '' })
        }
        newState.inventory = items
      } else if (target === 'condition' && subject) {
        const conds = [...(newState.sheet.conditions || [])]
        if (value === 'remove' || value.startsWith('-')) {
          const idx = conds.indexOf(subject)
          if (idx !== -1) conds.splice(idx, 1)
        } else {
          if (!conds.includes(subject)) conds.push(subject)
        }
        newState.sheet = { ...newState.sheet, conditions: conds }
      }

      if (newState.current !== null) {
        const updated = [...newState.characters]
        const existing =
          updated[newState.current] || {
            name: '',
            sheet: createSheet(),
            inventory: [],
            scrolls: []
          }
        updated[newState.current] = {
          ...existing,
          sheet: newState.sheet,
          inventory: newState.inventory,
          scrolls: newState.scrolls
        }
        newState.characters = updated
      }

      newState.log = [
        { label, notation: value, output, total: amount },
        ...newState.log
      ]
      newState.overlay = { message, roll: null, visible: true }
      return { state: newState, overlayTimeout: timeout }
    }, false, 'applyEffect')
    return amount
  },
  setDiceStyle: style =>
    set(({ state }) => ({ state: { ...state, diceStyle: style } }), false, 'setDiceStyle')
})

type PersistedState = {
  state: { characters: Character[]; log: LogEntry[]; diceStyle: DiceStyle }
}

const storeWithPersist = persist(storeCreator, {
  name: 'openroll-store',
  storage: createJSONStorage<PersistedState>(() => localStorage),
  partialize: state => ({
    state: {
      characters: state.state.characters,
      log: state.state.log,
      diceStyle: state.state.diceStyle
    }
  }),
  merge: (persistedState, currentState) => ({
    ...currentState,
    state: {
      ...currentState.state,
      ...(persistedState as PersistedState).state
    }
  })
})

const store = (import.meta.env.DEV
  ? devtools(storeWithPersist)
  : storeWithPersist) as StateCreator<
  GameContextValue,
  [],
  [["zustand/devtools", never], ["zustand/persist", unknown]]
>

export const useGameContext = create<GameContextValue>()(store)

// Alias for compatibility with previous naming
export type { GameContextValue as GameStore }

