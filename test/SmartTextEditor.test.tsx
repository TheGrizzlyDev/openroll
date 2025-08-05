import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import SmartTextEditor from '../src/components/SmartTextEditor'
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

describe('SmartTextEditor', () => {
  it('switches between modes and saves changes', () => {
    const roll = vi.fn()
    const onChange = vi.fn()
    const providerValue = { roll }
    const initial = 'Roll [dice 1d4] now'
    const { getByText, getByRole, queryByRole } = renderWithContext(
      <SmartTextEditor value={initial} onChange={onChange} />, { providerValue }
    )
    getByText('1d4')
    const toggle = getByText('Edit')
    fireEvent.click(toggle)
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe(initial)
    fireEvent.change(textarea, { target: { value: 'Say [dice 2d6]' } })
    fireEvent.click(getByText('Save'))
    expect(onChange).toHaveBeenCalledWith('Say [dice 2d6]')
    expect(queryByRole('textbox')).toBeNull()
    getByText('Edit')
  })

  it('calls roll when dice badge clicked in visual mode', () => {
    const roll = vi.fn()
    const providerValue = { roll }
    const { getByText } = renderWithContext(
      <SmartTextEditor value={'Roll [dice 1d4]'} onChange={() => {}} />, { providerValue }
    )
    const badge = getByText('1d4')
    fireEvent.click(badge)
    expect(roll).toHaveBeenCalledWith('1d4')
  })
})
