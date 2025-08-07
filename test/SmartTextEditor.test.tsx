import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import SmartTextEditor from '../src/components/SmartTextEditor'
import { useGameContext } from '../src/GameContext'
import { autocompletion } from '@codemirror/autocomplete'

vi.mock('@codemirror/autocomplete', () => ({ autocompletion: vi.fn(() => ({})) }))
vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    value,
    onChange
  }: {
    value: string
    onChange: (_value: string) => void
  }) => <textarea value={value} onChange={e => onChange(e.target.value)} />
}))

afterEach(() => {
  cleanup()
  useGameContext.setState({ roll: vi.fn(() => ({ total: 0, output: '' })) })
  vi.mocked(autocompletion).mockClear()
})

describe('SmartTextEditor', () => {
  it('renders correctly', () => {
    useGameContext.setState({ roll: vi.fn(() => ({ total: 0, output: '' })) })
    const { container } = render(
      <SmartTextEditor value="" onChange={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('switches between modes and saves changes', () => {
    const roll = vi.fn(() => ({ total: 0, output: '' }))
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
    const roll = vi.fn(() => ({ total: 0, output: '' }))
    useGameContext.setState({ roll })
    const { getByText } = render(
      <SmartTextEditor value={'Roll [dice "1d4" 1d4]'} onChange={() => {}} />
    )
    const badge = getByText('1d4')
    fireEvent.click(badge)
    expect(roll).toHaveBeenCalledWith('1d4')
  })

  it('disables autocompletion on mobile', () => {
    const originalUa = navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Android',
      configurable: true
    })
    render(<SmartTextEditor value="" onChange={() => {}} />)
    expect(autocompletion).not.toHaveBeenCalled()
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUa
    })
  })
})

