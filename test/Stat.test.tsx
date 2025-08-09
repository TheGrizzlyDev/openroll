import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Stat } from '../src/design-system'

describe('Stat component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('increments and decrements value', () => {
    const handleChange = vi.fn()
    const { getByLabelText } = render(
      <Stat id="test" value={5} onChange={handleChange} onRoll={() => {}} onEdit={() => {}} />
    )
    fireEvent.click(getByLabelText('Increment'))
    fireEvent.click(getByLabelText('Decrement'))
    expect(handleChange).toHaveBeenNthCalledWith(1, 6)
    expect(handleChange).toHaveBeenNthCalledWith(2, 4)
  })

  it('calls onInfo when info button clicked', () => {
    const handleInfo = vi.fn()
    const { getByLabelText } = render(
      <Stat id="test" value={5} onChange={() => {}} onRoll={() => {}} onEdit={() => {}} onInfo={handleInfo} />
    )
    fireEvent.click(getByLabelText('Info'))
    expect(handleInfo).toHaveBeenCalled()
  })

  it('triggers advantage roll on long press', () => {
    const handleRoll = vi.fn()
    const handleAdv = vi.fn()
    const { getByLabelText } = render(
      <Stat
        id="test"
        value={5}
        onChange={() => {}}
        onRoll={handleRoll}
        onEdit={() => {}}
        onRollAdv={handleAdv}
      />
    )
    const rollButton = getByLabelText(/Roll/)
    fireEvent.mouseDown(rollButton)
    vi.advanceTimersByTime(600)
    fireEvent.mouseUp(rollButton)
    expect(handleAdv).toHaveBeenCalled()
    expect(handleRoll).not.toHaveBeenCalled()
  })
})
