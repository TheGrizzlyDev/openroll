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
      <div className="relative h-10 w-20 rounded grid place-items-center border-2 border-accent bg-bg shadow-[inset_0_0_12px_rgba(0,0,0,.85)]">
        <span className="text-base font-extrabold text-text font-mono tabular-nums">{value}</span>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-0 right-0 h-px opacity-70"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 2px, transparent 2px 6px)'
          }}
        />
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
