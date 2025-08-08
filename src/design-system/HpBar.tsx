import { Button } from './Button'

interface HpBarProps {
  hp: number
  tempHp: number
  maxHp: number
  onHpChange: (_hp: number) => void
  onTempHpChange: (_tempHp: number) => void
  onMaxHpChange: (_maxHp: number) => void
}

export function HpBar({
  hp,
  tempHp,
  maxHp,
  onHpChange,
  onTempHpChange,
  onMaxHpChange
}: HpBarProps) {
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max)

  const pct = maxHp > 0 ? clamp(hp / maxHp, 0, 1) : 0
  const tempPct = maxHp > 0 ? clamp((hp + tempHp) / maxHp, 0, 1) : 0

  const state = pct <= 0.25 ? 'danger' : pct <= 0.5 ? 'warn' : 'ok'
  const barColor =
    state === 'danger'
      ? 'bg-red-600'
      : state === 'warn'
        ? 'bg-yellow-500'
        : 'bg-green-600'

  const changeHp = (delta: number) =>
    onHpChange(clamp(hp + delta, 0, maxHp))

  const changeTempHp = (delta: number) =>
    onTempHpChange(Math.max(0, tempHp + delta))

  const changeMaxHp = (delta: number) => {
    const next = Math.max(0, maxHp + delta)
    onMaxHpChange(next)
    if (hp > next) onHpChange(next)
  }

  return (
    <div className="hp-bar">
      <div className="flex items-center mb-2">
        <span className="mr-2">HP</span>
        <div className="relative flex-1 h-4 bg-bg-alt border border-accent rounded overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500/50"
            style={{ width: `${tempPct * 100}%` }}
          />
          <div
            className={`${barColor} h-full`}
            style={{ width: `${pct * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {hp}/{maxHp}
            {tempHp ? ` (+${tempHp})` : ''}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="flex space-x-1">
          <Button
            type="button"
            aria-label="Decrease HP"
            onClick={() => changeHp(-1)}
            className="numeric-input-button"
          >
            −
          </Button>
          <Button
            type="button"
            aria-label="Increase HP"
            onClick={() => changeHp(1)}
            className="numeric-input-button"
          >
            +
          </Button>
        </div>
        <div className="flex space-x-1">
          <Button
            type="button"
            aria-label="Decrease Temp HP"
            onClick={() => changeTempHp(-1)}
            className="numeric-input-button"
          >
            −
          </Button>
          <Button
            type="button"
            aria-label="Increase Temp HP"
            onClick={() => changeTempHp(1)}
            className="numeric-input-button"
          >
            +
          </Button>
        </div>
        <div className="flex space-x-1">
          <Button
            type="button"
            aria-label="Decrease Max HP"
            onClick={() => changeMaxHp(-1)}
            className="numeric-input-button"
          >
            −
          </Button>
          <Button
            type="button"
            aria-label="Increase Max HP"
            onClick={() => changeMaxHp(1)}
            className="numeric-input-button"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}

