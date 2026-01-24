import { describe, it, expect, afterEach, vi } from 'vitest'
import { NumberGenerator } from '@dice-roller/rpg-dice-roller'
import { createSheet } from '../src/mork_borg/sheet'
import { useGameContext, type GameState } from '../src/stores/GameContext'
import type { ApplyNode } from '../src/oml/parser'

const resetStore = (state: Partial<GameState> = {}) => {
  const initial = useGameContext.getInitialState()
  useGameContext.setState(
    {
      ...initial,
      state: { ...initial.state, ...state },
      overlayTimeout: null
    },
    true,
  )
}

afterEach(() => {
  NumberGenerator.generator.engine = NumberGenerator.engines.nativeMath
  vi.restoreAllMocks()
  resetStore()
})

describe('GameContext', () => {
  it('loads characters with numeric and string ids', () => {
    const sheetA = { ...createSheet(), name: 'Numbered' }
    const sheetB = { ...createSheet(), name: 'Alpha' }
    const characters = [
      {
        id: 42 as unknown as string,
        name: 'Numbered',
        sheet: sheetA,
        inventory: [{ id: 1, name: 'Torch', qty: 1, notes: '' }],
        scrolls: []
      },
      {
        id: 'alpha',
        name: 'Alpha',
        sheet: sheetB,
        inventory: [],
        scrolls: []
      }
    ]
    resetStore({ characters })
    vi.spyOn(Date, 'now').mockReturnValueOnce(111).mockReturnValueOnce(222)

    const { loadCharacter } = useGameContext.getState()
    loadCharacter(0)
    let state = useGameContext.getState().state
    expect(state.current).toBe(0)
    expect(state.sheet.name).toBe('Numbered')
    expect(state.lastAccess['42']).toBe(111)
    expect(state.inventory[0]?.name).toBe('Torch')

    loadCharacter(1)
    state = useGameContext.getState().state
    expect(state.current).toBe(1)
    expect(state.sheet.name).toBe('Alpha')
    expect(state.lastAccess['alpha']).toBe(222)
  })

  it('roundtrips exported characters', () => {
    const sheetA = { ...createSheet(), name: 'One' }
    const sheetB = { ...createSheet(), name: 'Two' }
    const characters = [
      {
        id: 'one',
        name: 'One',
        sheet: sheetA,
        inventory: [],
        scrolls: []
      },
      {
        id: 'two',
        name: 'Two',
        sheet: sheetB,
        inventory: [],
        scrolls: []
      }
    ]
    const lastAccess = { one: 1000, two: 2000 }
    resetStore({ characters, lastAccess })

    const data = useGameContext.getState().exportCharacters()
    const parsed = JSON.parse(data) as Array<{ id: string; lastAccess?: number }>
    expect(parsed).toHaveLength(2)
    expect(parsed[0]?.lastAccess).toBe(1000)
    expect(parsed[1]?.lastAccess).toBe(2000)

    resetStore()
    const success = useGameContext.getState().importCharacters(data)
    expect(success).toBe(true)

    const state = useGameContext.getState().state
    expect(state.characters).toHaveLength(2)
    expect(state.characters[0]?.id).toBe('one')
    expect(state.characters[1]?.id).toBe('two')
    expect(state.lastAccess).toMatchObject(lastAccess)
  })

  it('applies hp, stat, inventory, and condition effects', () => {
    NumberGenerator.generator.engine = NumberGenerator.engines.min
    const sheet = { ...createSheet(), hp: 10, str: 1, conditions: [] }
    const inventory = [{ id: 1, name: 'Torch', qty: 1, notes: '' }]
    resetStore({ sheet, inventory })

    const { applyEffect } = useGameContext.getState()

    const hpEffect: ApplyNode = { type: 'apply', target: 'hp', value: '1d4', attrs: {} }
    applyEffect(hpEffect)
    let state = useGameContext.getState().state
    expect(state.sheet.hp).toBe(11)

    const strEffect: ApplyNode = { type: 'apply', target: 'str', value: '2', attrs: {} }
    applyEffect(strEffect)
    state = useGameContext.getState().state
    expect(state.sheet.str).toBe(3)

    const torchEffect: ApplyNode = {
      type: 'apply',
      target: 'item',
      subject: 'Torch',
      value: '2',
      attrs: {}
    }
    applyEffect(torchEffect)
    state = useGameContext.getState().state
    expect(state.inventory.find(item => item.name === 'Torch')?.qty).toBe(3)

    const ropeEffect: ApplyNode = {
      type: 'apply',
      target: 'item',
      subject: 'Rope',
      value: '1',
      attrs: {}
    }
    applyEffect(ropeEffect)
    state = useGameContext.getState().state
    expect(state.inventory.find(item => item.name === 'Rope')?.qty).toBe(1)

    const addCondition: ApplyNode = {
      type: 'apply',
      target: 'condition',
      subject: 'Poisoned',
      value: 'add',
      attrs: {}
    }
    applyEffect(addCondition)
    state = useGameContext.getState().state
    expect(state.sheet.conditions).toContain('Poisoned')

    const removeCondition: ApplyNode = {
      type: 'apply',
      target: 'condition',
      subject: 'Poisoned',
      value: 'remove',
      attrs: {}
    }
    applyEffect(removeCondition)
    state = useGameContext.getState().state
    expect(state.sheet.conditions).not.toContain('Poisoned')
  })

  it('defaults missing character names when finalizing', () => {
    const sheet = { ...createSheet(), name: '' }
    resetStore({ sheet, inventory: [], scrolls: [] })

    const { finalizeCharacter } = useGameContext.getState()
    const index = finalizeCharacter()

    const state = useGameContext.getState().state
    const finalized = state.characters[index]
    expect(finalized?.name).toBe('Mark Borg')
    expect(finalized?.sheet.name).toBe('Mark Borg')
    expect(state.sheet.name).toBe('Mark Borg')
  })
})
