import type React from 'react'

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  min?: number
  max?: number
  step?: number
}

export default function NumericInput({ value, onChange, min, max, step = 1, ...props }: NumericInputProps) {
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
    <div className="numeric-input" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <button
        type="button"
        aria-label="Decrease value"
        onClick={() => handleButton(-step)}
        style={{
          background: '#111',
          color: '#ffff00',
          border: '1px solid #ffff00',
          borderRadius: '20px',
          padding: '0.25rem',
          width: '1.5rem',
          lineHeight: 1,
        }}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        style={{ flex: 1, textAlign: 'center', margin: '0 4px' }}
        {...props}
      />
      <button
        type="button"
        aria-label="Increase value"
        onClick={() => handleButton(step)}
        style={{
          background: '#111',
          color: '#ffff00',
          border: '1px solid #ffff00',
          borderRadius: '20px',
          padding: '0.25rem',
          width: '1.5rem',
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  )
}
