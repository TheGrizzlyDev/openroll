import { type ChangeEvent } from 'react'
import { Button } from './Button'
import { Input } from './Input'

interface HpBarProps {
  hp: number
  maxHp: number
  onHpChange: (_hp: number) => void
  onMaxHpChange: (_maxHp: number) => void
}

export function HpBar({ hp, maxHp, onHpChange, onMaxHpChange }: HpBarProps) {
  const pct = maxHp > 0 ? Math.min(Math.max(hp / maxHp, 0), 1) * 100 : 0

  const handleInput = (
    setter: (_value: number) => void,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value)
    setter(Number.isFinite(value) ? value : 0)
  }

  const handleButton = (
    setter: (_value: number) => void,
    value: number,
    delta: number
  ) => {
    const next = Math.max(0, value + delta)
    setter(next)
  }

  return (
    <div className="hp-bar">
      <div className="flex items-center mb-2">
        <span className="mr-2">HP</span>
        <div className="flex-1 h-4 bg-bg-alt border border-accent rounded overflow-hidden">
          <div className="bg-accent h-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="ml-2">
          {hp}/{maxHp}
        </span>
      </div>
      <div className="flex space-x-2">
        <div className="numeric-input">
          <Button
            type="button"
            aria-label="Decrease HP"
            onClick={() => handleButton(onHpChange, hp, -1)}
            className="numeric-input-button"
          >
            −
          </Button>
          <Input
            type="number"
            value={hp}
            min={0}
            onChange={e => handleInput(onHpChange, e)}
            className="numeric-input-field"
          />
          <Button
            type="button"
            aria-label="Increase HP"
            onClick={() => handleButton(onHpChange, hp, 1)}
            className="numeric-input-button"
          >
            +
          </Button>
        </div>
        <div className="numeric-input">
          <Button
            type="button"
            aria-label="Decrease Max HP"
            onClick={() => handleButton(onMaxHpChange, maxHp, -1)}
            className="numeric-input-button"
          >
            −
          </Button>
          <Input
            type="number"
            value={maxHp}
            min={0}
            onChange={e => handleInput(onMaxHpChange, e)}
            className="numeric-input-field"
          />
          <Button
            type="button"
            aria-label="Increase Max HP"
            onClick={() => handleButton(onMaxHpChange, maxHp, 1)}
            className="numeric-input-button"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}
