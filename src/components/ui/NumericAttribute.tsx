import { Button } from '.'
import { useSettingsStore } from '../../stores/settingsStore'

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
  const variant = useSettingsStore(state => state.navButtonVariant)
  const clamp = (val: number) => {
    if (typeof min === 'number') val = Math.max(min, val)
    if (typeof max === 'number') val = Math.min(max, val)
    return val
  }
  const change = (delta: number) => onChange(clamp(value + delta))

  return (
    <div className="inline-flex items-center gap-1">
      <Button
        type="button"
        aria-label={`Decrease ${id}`}
        className="h-8 w-8"
        onClick={() => change(-step)}
        variant={variant}
      >
        −
      </Button>
      <input
        id={id}
        type="number"
        className="h-8 w-8 text-center border border-accent font-mono font-bold text-sm"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(clamp(e.target.valueAsNumber))}
      />
      <Button
        type="button"
        aria-label={`Increase ${id}`}
        className="h-8 w-8"
        onClick={() => change(step)}
        variant={variant}
      >
        +
      </Button>
    </div>
  )
}
