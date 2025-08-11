import * as Progress from '@radix-ui/react-progress'
import { Button } from '.'
import { useSettingsStore } from '../settingsStore'

interface HpBarProps {
  hp: number
  tempHp?: number
  maxHp: number
  onHpChange: (_hp: number) => void
  onTempHpChange?: ((_tempHp: number) => void) | null
  onMaxHpChange: (_maxHp: number) => void
}

export function HpBar({
  hp,
  tempHp = 0,
  maxHp,
  onHpChange,
  onTempHpChange = null,
  onMaxHpChange
}: HpBarProps) {
  const hpBarVariant = useSettingsStore(state => state.hpBarVariant)
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max)

  const pct = maxHp > 0 ? clamp(hp / maxHp, 0, 1) : 0
  const tempEnabled = !!onTempHpChange
  const tempPct = tempEnabled && maxHp > 0 ? clamp((hp + tempHp) / maxHp, 0, 1) : pct
  const barColor = pct <= 0.5 ? 'bg-error' : 'bg-accent'

  const changeHp = (delta: number) => onHpChange(clamp(hp + delta, 0, maxHp))
  const changeTempHp = (delta: number) => {
    if (!tempEnabled) return
    onTempHpChange!(Math.max(0, tempHp + delta))
  }
  const changeMaxHp = (delta: number) => {
    const next = Math.max(0, maxHp + delta)
    onMaxHpChange(next)
    if (hp > next) onHpChange(next)
  }

  return (
    <div className="hp-bar select-none" aria-label="Hit Points">
      <Progress.Root value={pct * 100} className="relative h-4 w-full rounded border border-accent bg-bg-alt">
        {tempEnabled && tempHp > 0 && (
          <div
            className="absolute inset-y-0 left-0 bg-blue-300/50"
            style={{ width: `${tempPct * 100}%` }}
          />
        )}
        <Progress.Indicator
          className={["absolute inset-y-0 left-0", barColor].join(" ")}
          style={{ width: `${pct * 100}%` }}
        />
        <span className="absolute inset-0 grid place-items-center text-xs font-bold">
          {hp}/{maxHp}
          {tempEnabled && tempHp ? ` (+${tempHp})` : ''}
        </span>
      </Progress.Root>

      <div className={`mt-1 grid grid-cols-${tempEnabled ? 3 : 2} gap-1`}>
        <div className="flex">
          <Button
            type="button"
            aria-label="Decrease HP"
            onClick={() => changeHp(-1)}
            className="flex-1 px-2 py-1 text-xs"
            variant={hpBarVariant}
          >
            − HP
          </Button>
          <Button
            type="button"
            aria-label="Increase HP"
            onClick={() => changeHp(1)}
            className="ml-1 flex-1 px-2 py-1 text-xs"
            variant={hpBarVariant}
          >
            + HP
          </Button>
        </div>

        {tempEnabled && (
          <div className="flex">
            <Button
              type="button"
              aria-label="Decrease temporary HP"
              onClick={() => changeTempHp(-1)}
              className="flex-1 px-2 py-1 text-xs"
              variant={hpBarVariant}
            >
              − Temp
            </Button>
            <Button
              type="button"
              aria-label="Increase temporary HP"
              onClick={() => changeTempHp(1)}
              className="ml-1 flex-1 px-2 py-1 text-xs"
              variant={hpBarVariant}
            >
              + Temp
            </Button>
          </div>
        )}

        <div className="flex">
          <Button
            type="button"
            aria-label="Decrease maximum HP"
            onClick={() => changeMaxHp(-1)}
            className="flex-1 px-2 py-1 text-xs"
            variant={hpBarVariant}
          >
            − Max
          </Button>
          <Button
            type="button"
            aria-label="Increase maximum HP"
            onClick={() => changeMaxHp(1)}
            className="ml-1 flex-1 px-2 py-1 text-xs"
            variant={hpBarVariant}
          >
            + Max
          </Button>
        </div>
      </div>
    </div>
  )
}

