import { Button } from './Button'

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
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max)

  const pct = maxHp > 0 ? clamp(hp / maxHp, 0, 1) : 0
  const tempEnabled = !!onTempHpChange
  const tempPct = tempEnabled && maxHp > 0 ? clamp((hp + tempHp) / maxHp, 0, 1) : pct

  const isDanger = pct <= 0.25
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

  const noiseOverlay =
    'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,.06) 50%, transparent 51%),' +
    'radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,.05) 50%, transparent 51%),' +
    'radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,.04) 50%, transparent 51%),' +
    'radial-gradient(1px 1px at 50% 30%, rgba(255,255,255,.06) 50%, transparent 51%)'

  const hatchOverlay =
    'repeating-linear-gradient(135deg, rgba(0,0,0,.0) 0 6px, rgba(0,0,0,.35) 6px 12px)'

  return (
    <div className="hp-bar select-none" aria-label="Hit Points">
      {/* Bar: thicker + compact wrapper */}
      <div
        className={[
          'relative w-full',
          'h-9',                     // thicker for readability
          'rounded-sm border-2 border-accent',
          'bg-bg-alt',
          'shadow-[0_0_0_1px_rgba(0,0,0,0.8),inset_0_0_12px_rgba(0,0,0,0.8)]',
          isDanger ? 'animate-pulse' : ''
        ].join(' ')}
        style={{
          backgroundImage: noiseOverlay + ',repeating-linear-gradient(to right, rgba(0,0,0,.28) 0 1px, transparent 1px 8%)',
          backgroundSize: 'auto, 8% 100%',
          imageRendering: 'pixelated'
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxHp}
        aria-valuenow={hp}
        aria-valuetext={
          tempEnabled && tempHp > 0
            ? `${hp} of ${maxHp} plus ${tempHp} temporary`
            : `${hp} of ${maxHp}`
        }
      >
        {/* Temp band (behind), only if temp enabled */}
        {tempEnabled && tempHp > 0 && (
          <div
            className="absolute inset-y-0 left-0 pointer-events-none mix-blend-screen"
            style={{
              width: `${tempPct * 100}%`,
              background:
                'linear-gradient(to right, rgba(0,180,255,.30), rgba(0,180,255,.18))',
              maskImage: hatchOverlay,
              WebkitMaskImage: hatchOverlay,
              maskSize: '12px 12px',
              WebkitMaskSize: '12px 12px'
            }}
            aria-hidden
          />
        )}

        {/* Main HP fill */}
        <div
          className={[
            'absolute inset-y-0 left-0',
            barColor,
            'transition-[width] duration-200 ease-out'
          ].join(' ')}
          style={{ width: `${pct * 100}%` }}
          aria-hidden
        />

        {/* Label: larger, high-contrast */}
        <div
          className="absolute inset-0 grid place-items-center text-xs md:text-sm font-black tracking-wide text-text drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]"
        >
          {hp}/{maxHp}{tempEnabled && tempHp ? ` (+${tempHp})` : ''}
        </div>

        {/* Light hairline on top for depth */}
        <div
          className="absolute left-0 right-0 -top-px h-px opacity-60"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 2px, transparent 2px 6px)'
          }}
          aria-hidden
        />
      </div>

      {/* Controls: ultra-compact, single row, bigger touch targets */}
      <div className={`mt-1 grid grid-cols-${tempEnabled ? 3 : 2} gap-1`}>
        {/* HP */}
        <div className="flex">
          <Button
            type="button"
            aria-label="Decrease HP"
            onClick={() => changeHp(-1)}
            className="flex-1 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="HP −1"
          >
            − HP
          </Button>
          <Button
            type="button"
            aria-label="Increase HP"
            onClick={() => changeHp(1)}
            className="ml-1 flex-1 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="HP +1"
          >
            + HP
          </Button>
        </div>

        {/* Temp (hidden if disabled) */}
        {tempEnabled && (
          <div className="flex">
            <Button
              type="button"
              aria-label="Decrease temporary HP"
              onClick={() => changeTempHp(-1)}
              className="flex-1 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title="Temp −1"
            >
              − Temp
            </Button>
            <Button
              type="button"
              aria-label="Increase temporary HP"
              onClick={() => changeTempHp(1)}
              className="ml-1 flex-1 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title="Temp +1"
            >
              + Temp
            </Button>
          </div>
        )}

        {/* Max HP */}
        <div className="flex">
          <Button
            type="button"
            aria-label="Decrease maximum HP"
            onClick={() => changeMaxHp(-1)}
            className="flex-1 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Max −1"
          >
            − Max
          </Button>
          <Button
            type="button"
            aria-label="Increase maximum HP"
            onClick={() => changeMaxHp(1)}
            className="ml-1 flex-1 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Max +1"
          >
            + Max
          </Button>
        </div>
      </div>
    </div>
  )
}
