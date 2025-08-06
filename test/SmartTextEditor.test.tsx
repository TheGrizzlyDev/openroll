import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import SmartTextEditor from '../src/components/SmartTextEditor'
import { useGameContext } from '../src/GameContext'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea value={value} onChange={e => onChange(e.target.value)} />
  )
}))

afterEach(() => {
  cleanup()
  useGameContext.setState({ roll: vi.fn() })
})

describe('SmartTextEditor', () => {
  it('switches between modes and saves changes', () => {
    const roll = vi.fn()
    const onChange = vi.fn()
    useGameContext.setState({ roll })
    const initial = 'Roll [dice "1d4" 1d4] now'
    const { getByText, getByRole, queryByRole } = render(
      <SmartTextEditor value={initial} onChange={onChange} />
    )
    getByText('1d4')
    const toggle = getByText('Edit')
    fireEvent.click(toggle)
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe(initial)
    fireEvent.change(textarea, { target: { value: 'Say [dice "2d6" 2d6]' } })
    fireEvent.click(getByText('Save'))
    expect(onChange).toHaveBeenCalledWith('Say [dice "2d6" 2d6]')
    expect(queryByRole('textbox')).toBeNull()
    getByText('Edit')
  })

  it('calls roll when dice badge clicked in visual mode', () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { getByText } = render(
      <SmartTextEditor value={'Roll [dice "1d4" 1d4]'} onChange={() => {}} />
    )
    const badge = getByText('1d4')
    fireEvent.click(badge)
    expect(roll).toHaveBeenCalledWith('1d4')
  })
})

