import { type ChangeEvent, useRef } from 'react'
import { Button } from './Button'
import { Input } from './Input'

interface StatProps {
  id: string
  value: number
  onChange: (_value: number) => void
  onRoll: () => void
  onEdit: () => void
  onRollAdv?: () => void
  onInfo?: () => void
}

export function Stat({ id, value, onChange, onRoll, onEdit, onRollAdv, onInfo }: StatProps) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = () => {
    if (onRollAdv) {
      timeout.current = setTimeout(() => {
        timeout.current = null
        onRollAdv()
      }, 500)
    }
  }

  const end = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
      onRoll()
    } else if (!onRollAdv) {
      onRoll()
    }
  }

  return (
    <div className="group flex items-center gap-1">
      {onInfo && (
        <Button
          type="button"
          aria-label="Info"
          onClick={onInfo}
          className="h-8 w-8 p-1"
        >
          ℹ️
        </Button>
      )}
      <Button
        type="button"
        aria-label="Decrement"
        onClick={() => onChange(value - 1)}
        className="h-8 w-8 p-1"
      >
        −
      </Button>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="w-16 text-center"
      />
      <Button
        type="button"
        aria-label="Increment"
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 p-1"
      >
        +
      </Button>
      <Button
        type="button"
        icon="dice"
        aria-label="Roll"
        onMouseDown={start}
        onMouseUp={end}
        onTouchStart={start}
        onTouchEnd={end}
        className="h-8 w-8 p-1"
      />
      <Button
        type="button"
        icon="edit"
        aria-label="Edit notation"
        onClick={onEdit}
        className="h-8 w-8 p-1 invisible group-hover:visible group-focus-within:visible"
      />
    </div>
  )
}
