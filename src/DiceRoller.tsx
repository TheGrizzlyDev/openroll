import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type CSSProperties
} from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from './GameContext'
import { Input, Button } from './design-system'

interface DiceRollerProps {
  iconButton?: boolean
}

export default function DiceRoller({ iconButton = false }: DiceRollerProps) {
  const { roll } = useGameContext()
  const [notation, setNotation] = useState('1d20')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ total: number; output: string } | null>(null)

  const srOnly: CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }

  const handleRoll = () => {
    try {
      Parser.parse(notation)
      const { total, output } = roll(notation)
      setResult({ total, output })
      setError('')
    } catch {
      setError('Invalid notation')
    }
  }

  const containerClass = iconButton
    ? 'flex items-center gap-2'
    : 'dice-roller mb-4 flex items-center gap-2 max-[400px]:flex-col max-[400px]:items-stretch max-[400px]:gap-1'

  const buttonClass = iconButton ? undefined : 'max-[400px]:w-full'

  return (
    <div className={containerClass}>
      <Input
        type="text"
        value={notation}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNotation(e.target.value)
          setError('')
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleRoll()
          }
        }}
        placeholder="1d20"
        className={error ? 'border-error' : undefined}
      />
      <Button onClick={handleRoll} className={buttonClass} aria-label="Roll">
        {iconButton ? '🎲' : 'Roll'}
      </Button>
      {error && <span className="text-error text-xs">{error}</span>}
      {result !== null && (
        <span style={srOnly} aria-live="polite">
          {result.output}
        </span>
      )}
    </div>
  )
}
