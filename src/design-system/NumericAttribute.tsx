import { Button } from '.'

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
    if (typeof min === 'number') val = Math.max(min, val)
    if (typeof max === 'number') val = Math.min(max, val)
    return val
  }
  const change = (delta: number) => onChange(clamp(value + delta))

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        aria-label={`Decrease ${id}`}
        className="h-10 w-10"
        onClick={() => change(-step)}
      >
        −
      </Button>
      <input
        id={id}
        type="number"
        className="h-10 w-10 text-center border border-accent font-mono font-bold"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(clamp(e.target.valueAsNumber))}
      />
      <Button
        type="button"
        aria-label={`Increase ${id}`}
        className="h-10 w-10"
        onClick={() => change(step)}
      >
        +
      </Button>
    </div>
  )
}
