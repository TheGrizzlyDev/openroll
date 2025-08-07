import { render, fireEvent, createEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import DiceRoller from '../src/DiceRoller'
import { useGameContext } from '../src/GameContext'

afterEach(() => {
  cleanup()
  useGameContext.setState({ roll: vi.fn(() => ({ total: 0, output: '' })) })
})

describe('DiceRoller', () => {
  it('renders correctly', () => {
    useGameContext.setState({ roll: vi.fn(() => ({ total: 0, output: '' })) })
    const { container } = render(<DiceRoller />)
    expect(container).toMatchSnapshot()
  })

  it('rolls dice on button click', () => {
    const roll = vi.fn(() => ({ total: 0, output: '' }))
    useGameContext.setState({ roll })
    const { getByRole, getByText } = render(<DiceRoller />)
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2d6' } })
    fireEvent.click(getByText('Roll'))
    expect(roll).toHaveBeenCalledWith('2d6')
  })

  it('rolls dice on Enter key press and prevents default', () => {
    const roll = vi.fn(() => ({ total: 0, output: '' }))
    useGameContext.setState({ roll })
    const { getByRole } = render(<DiceRoller />)
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '3d8' } })
    const event = createEvent.keyDown(input, { key: 'Enter' })
    fireEvent(input, event)
    expect(roll).toHaveBeenCalledWith('3d8')
    expect(event.defaultPrevented).toBe(true)
  })
})

