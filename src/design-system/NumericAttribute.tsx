import { Button } from './Button'

interface NumericAttributeProps {
  id: string
  value: number
  onChange: (_value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumericAttribute({
  id,
  value,
  onChange,
  min,
  max,
  step = 1
}: NumericAttributeProps) {
  const clamp = (val: number) => {
    if (min !== undefined) val = Math.max(val, min)
    if (max !== undefined) val = Math.min(val, max)
    return val
  }

  const handle = (delta: number) => {
    onChange(clamp(value + delta))
  }

  return (
    <div id={id} className="inline-flex items-center gap-2">
      <Button
        type="button"
        aria-label={`Decrease ${id}`}
        onClick={() => handle(-step)}
        className="h-10 w-10 p-0 grid place-items-center rounded border border-accent bg-bg-alt hover:bg-bg hover:text-text active:translate-y-px text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        −
      </Button>
      <div className="h-10 w-10 rounded border border-accent text-center leading-10 font-extrabold font-mono text-text tabular-nums">
        {value}
      </div>
      <Button
        type="button"
        aria-label={`Increase ${id}`}
        onClick={() => handle(step)}
        className="h-10 w-10 p-0 grid place-items-center rounded border border-accent bg-bg-alt hover:bg-bg hover:text-text active:translate-y-px text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        +
      </Button>
    </div>
  )
}
