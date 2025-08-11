import { type ChangeEvent, type KeyboardEvent, useEffect, useRef } from 'react'
import { Button } from '.'

interface StatProps {
  id: string
  value: number
  onChange: (_value: number) => void
  onRoll: () => void
  onEdit: () => void
  onRollAdv?: () => void
  onInfo?: () => void
}

export function Stat({
  id,
  value,
  onChange,
  onRoll,
  onEdit,
  onRollAdv,
  onInfo
}: StatProps) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const liveRef = useRef<HTMLDivElement | null>(null)

  // Announce value changes for SR users when using +/- buttons
  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = `${id.toUpperCase()} ${value}`
  }, [value, id])

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

  const onRollKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    // Enter/Space activate buttons by default; we intercept Shift+Enter for advantage
    if (e.key === 'Enter' && e.shiftKey && onRollAdv) {
      e.preventDefault()
      onRollAdv()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Let default click happen (or call directly)
      e.preventDefault()
      onRoll()
    }
  }

  const labelId = `${id}-label`
  const hintId = `${id}-hint`

  return (
    <div className="p-3 border border-accent bg-bg rounded-[var(--border-radius)] flex items-center justify-between">
      <div className="group inline-flex items-center gap-2" role="group" aria-labelledby={labelId}>
        {/* Visual label is optional; we keep it screen-reader only by default */}
        <span id={labelId} className="sr-only">{id.toUpperCase()} stat</span>

        {/* Info (optional) */}
        {onInfo && (
          <Button
            type="button"
            aria-label={`${id.toUpperCase()} info`}
            onClick={onInfo}
            className="h-10 w-10 p-2"
            title="Info"
          >
            ℹ️
          </Button>
        )}

        {/* Decrement */}
        <Button
          type="button"
          aria-label={`Decrease ${id.toUpperCase()}`}
          onClick={() => onChange(value - 1)}
          className="h-10 w-10 p-0 active:translate-y-px"
          title={`Decrease ${id.toUpperCase()}`}
        >
          −
        </Button>

        {/* Value input (type=number exposes native spinbutton semantics to SRs) */}
        <div className="w-10 text-center tabular-nums">
          <label htmlFor={id} className="sr-only">
            {id.toUpperCase()} value
          </label>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(Number(e.target.value))
            }
            className="h-10 w-full rounded border border-accent bg-transparent text-center text-base font-extrabold font-mono text-text tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-describedby={hintId}
          />
        </div>

        {/* Increment */}
        <Button
          type="button"
          aria-label={`Increase ${id.toUpperCase()}`}
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 p-0 active:translate-y-px"
          title={`Increase ${id.toUpperCase()}`}
        >
          +
        </Button>

        {/* Roll (click = normal; hold 500ms = adv; Shift+Enter = adv) */}
        <Button
          type="button"
          icon="dice"
          aria-label={`Roll ${id.toUpperCase()}${onRollAdv ? ' (Shift+Enter for advantage or long-press)' : ''}`}
          title={onRollAdv ? 'Enter: Roll • Shift+Enter: Advantage • Long-press: Advantage' : 'Enter: Roll'}
          aria-keyshortcuts={onRollAdv ? 'Enter, Shift+Enter' : 'Enter'}
          onMouseDown={start}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchEnd={end}
          onTouchCancel={end}
          onKeyDown={onRollKeyDown}
          className={`h-10 w-10 p-2 active:translate-y-px ${
            onRollAdv ? 'border-error focus-visible:ring-error' : ''
          }`}
        />

        {/* Edit */}
        <Button
          type="button"
          icon="edit"
          aria-label={`Edit ${id.toUpperCase()} notation`}
          onClick={onEdit}
          className="h-10 w-10 p-2 active:translate-y-px"
          title="Edit notation"
        />

        {/* SR-only hint + live region */}
        <span id={hintId} className="sr-only">
          Use minus and plus to change {id.toUpperCase()}. Type a number, or use arrow keys in the field.
          Press Enter to roll. {onRollAdv ? 'Press Shift+Enter or long-press to roll with advantage.' : ''}
        </span>
        <div ref={liveRef} aria-live="polite" className="sr-only" />
      </div>
    </div>
  )
}
