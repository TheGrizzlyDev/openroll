import { useState, type CSSProperties } from 'react'
import { useGameContext } from './stores/GameContext'
import { Button } from './design-system'

export default function DiceRoller() {
  const { roll } = useGameContext()
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
    border: 0,
  }

  const handleRoll = () => {
    const { total, output } = roll('1d20')
    setResult({ total, output })
  }

  return (
    <>
      <Button
        onClick={handleRoll}
        className="h-10 w-10 p-2 active:translate-y-px"
        aria-label="Roll"
        title="Roll"
      >
        🎲
      </Button>
      {result !== null && (
        <span style={srOnly} aria-live="polite">
          {result.output}
        </span>
      )}
    </>
  )
}
