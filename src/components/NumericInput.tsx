import type React from 'react'
import { Button } from '../ui'

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  min?: number
  max?: number
  step?: number
  width?: React.CSSProperties['maxWidth']
}

export default function NumericInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
  width,
  ...props
}: NumericInputProps) {
  const clamp = (val: unknown) => {
    let num = Number(val)
    if (!Number.isFinite(num)) num = 0
    if (min !== undefined) num = Math.max(num, min)
    if (max !== undefined) num = Math.min(num, max)
    return num
  }

  const handleButton = (delta: number) => {
    const newVal = clamp((Number(value) || 0) + delta)
    onChange?.({ target: { value: String(newVal) } } as unknown as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <div className="numeric-input" style={width ? { maxWidth: width } : undefined}>
      <Button
        type="button"
        aria-label="Decrease value"
        onClick={() => handleButton(-step)}
        className="numeric-input-button"
      >
        −
      </Button>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={`numeric-input-field base-input${className ? ` ${className}` : ''}`}
        {...props}
      />
      <Button
        type="button"
        aria-label="Increase value"
        onClick={() => handleButton(step)}
        className="numeric-input-button"
      >
        +
      </Button>
    </div>
  )
}
