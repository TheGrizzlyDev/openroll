import { render, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Presets from '../src/components/Presets'
import { useGameContext } from '../src/GameContext'

const createStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
}

let localStorageMock: ReturnType<typeof createStorage>

beforeEach(() => {
  localStorageMock = createStorage()
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })
})

afterEach(() => {
  cleanup()
  useGameContext.setState({ roll: vi.fn() })
})

describe('DiceRoller presets', () => {
  it('renders default presets in order', async () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { findAllByRole } = render(<Presets />)
    const inputs = (await findAllByRole('textbox')) as HTMLInputElement[]
    expect(inputs.map(i => i.value)).toEqual([
      '1d4',
      '1d6',
      '1d8',
      '1d10',
      '1d12',
      '1d20'
    ])
  })

  it('adds, edits, and removes presets', async () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { findAllByRole, getByText, getAllByRole, getAllByText } = render(<Presets />)
    await findAllByRole('textbox')

    fireEvent.click(getByText('Add preset'))
    await waitFor(() => expect(getAllByRole('textbox')).toHaveLength(7))

    const firstInput = getAllByRole('textbox')[0] as HTMLInputElement
    fireEvent.change(firstInput, { target: { value: '2d4' } })
    expect(firstInput.value).toBe('2d4')

    const removeButtons = getAllByText('Remove')
    fireEvent.click(removeButtons[1])
    await waitFor(() => expect(getAllByRole('textbox')).toHaveLength(6))
    expect((getAllByRole('textbox')[1] as HTMLInputElement).value).toBe('1d8')
  })

  it('invokes roll with correct notation', async () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { findAllByText, findAllByRole } = render(<Presets />)
    await findAllByRole('textbox')
    const rollButtons = await findAllByText('Roll')
    fireEvent.click(rollButtons[0])
    expect(roll).toHaveBeenCalledWith('1d4', '1d4')
  })

  it('persists presets across re-renders via localStorage', async () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { findAllByRole, unmount } = render(<Presets />)
    const inputs = (await findAllByRole('textbox')) as HTMLInputElement[]
    fireEvent.change(inputs[0], { target: { value: '2d4' } })

    await waitFor(() =>
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'presets',
        expect.stringContaining('2d4')
      )
    )

    unmount()
    const { findAllByRole: findAllByRole2 } = render(<Presets />)
    const inputs2 = (await findAllByRole2('textbox')) as HTMLInputElement[]
    expect(inputs2[0].value).toBe('2d4')
    expect(localStorage.getItem).toHaveBeenCalledTimes(2)
  })
})

