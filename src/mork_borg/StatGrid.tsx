import type { Sheet } from './sheet'
import { Flex } from '../layout'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

interface StatGridProps {
  sheet: Sheet
  updateField: (_stat: StatKey, _value: number) => void
  rollStat: (_stat: StatKey, _advantage?: boolean) => void
}

const icons: Record<StatKey, string> = {
  str: '⚔️',
  agi: '⚡',
  pre: '👁️',
  tou: '🛡️'
}

export default function StatGrid({
  sheet,
  updateField,
  rollStat,
}: StatGridProps) {

  const renderStat = (stat: StatKey) => {
    const value = sheet[stat]
    const displayValue = value > 0 ? `+${value}` : `${value}`

    return (
      <div
        key={stat}
        className="mork-stat-box"
        style={{
          border: '2px solid var(--color-accent)',
          padding: '1rem',
          height: '160px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          background: 'black',
          color: 'var(--color-accent)'
        }}
        onClick={() => rollStat(stat)}
      >
        <Flex justify="between" align="start">
          <span style={{ fontSize: '1.5rem' }}>{icons[stat]}</span>
        </Flex>

        <div style={{ marginBottom: 'auto', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            {stat === 'str' ? 'STRENGTH' :
              stat === 'agi' ? 'AGILITY' :
                stat === 'pre' ? 'PRESENCE' : 'TOUGHNESS'}
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 0.9, color: '#fff' }}>
            {displayValue}
          </div>
        </div>

        {/* Hidden controls for editing could go here, or just rely on clicking to roll and maybe a long press/settings to edit? 
             For now, let's add small buttons at bottom right for editing or simple +/- overlay */}
        <div
          style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.25rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => updateField(stat, value - 1)}
            style={{ background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', width: '24px', height: '24px', cursor: 'pointer' }}
          >
            -
          </button>
          <button
            onClick={() => updateField(stat, value + 1)}
            style={{ background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', width: '24px', height: '24px', cursor: 'pointer' }}
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {(['str', 'agi', 'pre', 'tou'] as Array<StatKey>).map(renderStat)}
    </div>
  )
}
