import { type ChangeEvent } from 'react'
import { Button } from './Button'
import { Input } from './Input'

interface StatProps {
  label: string
  value: number
  onChange: (_e: ChangeEvent<HTMLInputElement>) => void
  onRoll: () => void
  onEdit: () => void
  error?: string
}

export function Stat({ label, value, onChange, onRoll, onEdit, error }: StatProps) {
  return (
    <div className="flex flex-col">
      <label>
        {label.toUpperCase()}
        <div className="group flex items-center gap-1">
          <Input
            type="number"
            value={value}
            onChange={onChange}
            className="w-16 text-center"
          />
          <Button
            type="button"
            icon="dice"
            aria-label="Roll"
            onClick={onRoll}
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
      </label>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
