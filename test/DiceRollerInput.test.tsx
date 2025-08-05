import React from 'react'
import { render, fireEvent, createEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import DiceRoller from '../src/DiceRoller'
import { GameContext, type GameContextValue } from '../src/GameContext'

const renderWithContext = (
  ui: React.ReactElement,
  { providerValue }: { providerValue: Partial<GameContextValue> }
) => {
  return render(
    <GameContext.Provider value={providerValue as GameContextValue}>{ui}</GameContext.Provider>
  )
}

afterEach(() => cleanup())

describe('DiceRoller', () => {
  it('rolls dice on button click', () => {
    const roll = vi.fn()
    const { getByRole, getByText } = renderWithContext(<DiceRoller />, { providerValue: { roll } })
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2d6' } })
    fireEvent.click(getByText('Roll'))
    expect(roll).toHaveBeenCalledWith('2d6')
  })

  it('rolls dice on Enter key press and prevents default', () => {
    const roll = vi.fn()
    const { getByRole } = renderWithContext(<DiceRoller />, { providerValue: { roll } })
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '3d8' } })
    const event = createEvent.keyDown(input, { key: 'Enter' })
    fireEvent(input, event)
    expect(roll).toHaveBeenCalledWith('3d8')
    expect(event.defaultPrevented).toBe(true)
  })
})
