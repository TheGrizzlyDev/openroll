import { create, type StateCreator } from 'zustand'
import { devtools, persist, createJSONStorage, type NamedSet } from 'zustand/middleware'
import { DiceRoller as DiceParser, type DiceRoll } from '@dice-roller/rpg-dice-roller'
import { createSheet, type Sheet } from './mork_borg/sheet'
import { generateCharacter } from './mork_borg/generateCharacter'
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
  id: string
  name: string
  sheet: Sheet
  inventory: InventoryItem[]
  scrolls: Scroll[]
}

export type DiceType = 'd4' | 'd6' | 'd8' | 'd12' | 'd20'

export interface OverlayState {
  message: string
  roll: { dice: Array<{ type: DiceType; result: number }>; total: number } | null
  visible: boolean
}

export interface DiceStyle {
  color: string
  edgeColor: string
  textureUrls: string[]
}

export interface GameState {
  characters: Character[]
  lastAccess: Record<string, number>
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
  roll: (_notation: string, _label?: string) => { total: number; output: string }
  logInventory: (_message: string) => void
  applyEffect: (_effect: ApplyNode) => number
  setDiceStyle: (_style: DiceStyle) => void
}

const initialState: GameState = {
  characters: [],
  lastAccess: {},
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
        let char = updated[state.current]
        if (!char) {
          char = {
            id: crypto.randomUUID(),
            name: '',
            sheet: createSheet(),
            inventory: [],
            scrolls: []
          }
        } else if (!char.id) {
          char = { ...char, id: crypto.randomUUID() }
        }
        char = {
          ...char,
          name: action.sheet.name,
          sheet: action.sheet,
          inventory: state.inventory,
          scrolls: state.scrolls
        }
        updated[state.current] = char
        const lastAccess = { ...state.lastAccess, [char.id]: Date.now() }
        newState.characters = updated
        newState.lastAccess = lastAccess
      }
      return newState
    }
    case 'SET_INVENTORY': {
      const newState = { ...state, inventory: action.inventory }
      if (state.current !== null) {
        const updated = [...state.characters]
        let char = updated[state.current]
        if (!char) {
          char = {
            id: crypto.randomUUID(),
            name: '',
            sheet: createSheet(),
            inventory: [],
            scrolls: []
          }
        } else if (!char.id) {
          char = { ...char, id: crypto.randomUUID() }
        }
        char = { ...char, inventory: action.inventory }
        updated[state.current] = char
        const lastAccess = { ...state.lastAccess, [char.id]: Date.now() }
        newState.characters = updated
        newState.lastAccess = lastAccess
      }
      return newState
    }
    case 'SET_SCROLLS': {
      const newState = { ...state, scrolls: action.scrolls }
      if (state.current !== null) {
        const updated = [...state.characters]
        let char = updated[state.current]
        if (!char) {
          char = {
            id: crypto.randomUUID(),
            name: '',
            sheet: createSheet(),
            inventory: state.inventory,
            scrolls: []
          }
        } else if (!char.id) {
          char = { ...char, id: crypto.randomUUID() }
        }
        char = { ...char, scrolls: action.scrolls }
        updated[state.current] = char
        const lastAccess = { ...state.lastAccess, [char.id]: Date.now() }
        newState.characters = updated
        newState.lastAccess = lastAccess
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
    const now = Date.now()
    const id = char.id ?? crypto.randomUUID()
    set(({ state }) => {
      const characters = [...state.characters]
      if (!char.id) {
        characters[idx] = { ...char, id }
      }
      const lastAccess = { ...state.lastAccess, [id]: now }
      return {
        state: {
          ...state,
          characters,
          lastAccess,
          current: idx,
          sheet: char.sheet || createSheet(),
          inventory: char.inventory || [],
          scrolls: char.scrolls || []
        }
      }
    }, false, 'loadCharacter')
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
    const existing = updated[index]
    const id = existing?.id ?? crypto.randomUUID()
    updated[index] = {
      id,
      name: '',
      sheet: state.sheet,
      inventory: state.inventory,
      scrolls: state.scrolls
    }
    const lastAccess = { ...state.lastAccess, [id]: Date.now() }
    set(
      {
        state: { ...state, characters: updated, lastAccess, current: index }
      },
      false,
      'finalizeCharacter'
    )
    return index
  },
  cancelCreation: () =>
    set(({ state }) => ({ state: { ...state, current: null } }), false, 'cancelCreation'),
  deleteCharacter: idx =>
    set(({ state }) => {
      const characters = state.characters.filter((_, i) => i !== idx)
      const lastAccess = { ...state.lastAccess }
      const char = state.characters[idx]
      if (char?.id) delete lastAccess[char.id]
      return {
        state: {
          ...state,
          characters,
          lastAccess,
          current: null
        }
      }
    }, false, 'deleteCharacter'),
  exportCharacters: () => {
    const { characters, lastAccess } = get().state
    const data = characters.map(c => ({ ...c, lastAccess: lastAccess[c.id] }))
    return JSON.stringify(data, null, 2)
  },
  importCharacters: data => {
    let parsed: unknown
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return false
    }
    if (!Array.isArray(parsed)) return false
    const sanitizedChars: Character[] = []
    const lastAccesses: Record<string, number> = {}
    parsed.forEach(c => {
      const id =
        typeof (c as { id?: string }).id === 'string'
          ? (c as { id: string }).id
          : crypto.randomUUID()
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
      const last = typeof (c as { lastAccess?: number }).lastAccess === 'number'
        ? (c as { lastAccess: number }).lastAccess
        : Date.now()
      sanitizedChars.push({ id, name, sheet, inventory, scrolls })
      lastAccesses[id] = last
    })
    set(
      ({ state }) => ({
        state: {
          ...state,
          characters: [...state.characters, ...sanitizedChars],
          lastAccess: { ...state.lastAccess, ...lastAccesses }
        }
      }),
      false,
      'importCharacters'
    )
    return true
  },
  roll: (notation: string, label = '') => {
    const roller = new DiceParser()
    const result = roller.roll(notation) as DiceRoll
    const total = result.total as number
    const entry: LogEntry = { label, notation, output: result.output, total }
    const diceResults: Array<{ type: DiceType; result: number }> = []
    const matches = [...notation.matchAll(/(\d*)d(4|6|8|12|20)/gi)]
    let matchIndex = 0
    for (const part of result.rolls as unknown[]) {
      if (part && typeof part === 'object' && 'rolls' in part) {
        const m = matches[matchIndex]
        const type = m ? (`d${m[2]}` as DiceType) : 'd20'
        for (const r of (part as { rolls: Array<{ value: number }> }).rolls) {
          diceResults.push({ type, result: r.value })
        }
        matchIndex++
      }
    }
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
        overlay: {
          message: result.output,
          roll: { dice: diceResults, total },
          visible: true
        }
      },
      overlayTimeout: timeout
    }), false, 'roll')
    return { total, output: result.output }
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
        let char = updated[newState.current]
        if (!char) {
          char = {
            id: crypto.randomUUID(),
            name: '',
            sheet: createSheet(),
            inventory: [],
            scrolls: []
          }
        } else if (!char.id) {
          char = { ...char, id: crypto.randomUUID() }
        }
        char = {
          ...char,
          sheet: newState.sheet,
          inventory: newState.inventory,
          scrolls: newState.scrolls
        }
        updated[newState.current] = char
        const lastAccess = { ...newState.lastAccess, [char.id]: Date.now() }
        newState.characters = updated
        newState.lastAccess = lastAccess
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
  state: {
    characters: Character[]
    lastAccess: Record<string, number>
    log: LogEntry[]
    diceStyle: DiceStyle
  }
}

const storeWithPersist = persist(storeCreator, {
  name: 'openroll-store',
  storage: createJSONStorage<PersistedState>(() => localStorage),
  partialize: state => ({
    state: {
      characters: state.state.characters,
      lastAccess: state.state.lastAccess,
      log: state.state.log,
      diceStyle: state.state.diceStyle
    }
  }),
  merge: (persistedState, currentState) => {
    const merged = {
      ...currentState,
      state: {
        ...currentState.state,
        ...(persistedState as PersistedState).state
      }
    }
    const lastAccess = { ...merged.state.lastAccess }
    merged.state.characters = merged.state.characters.map(c => {
      const id = c.id || crypto.randomUUID()
      const char = c.id ? c : { ...c, id }
      if (!lastAccess[id]) lastAccess[id] = Date.now()
      return char
    })
    merged.state.lastAccess = lastAccess
    return merged
  }
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

