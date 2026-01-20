import type { Sheet } from './sheet'
import { Flex } from '../layout'
import styles from './StatGrid.module.css'

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
        className={`${styles.statBox} mork-stat-box`}
        onClick={() => rollStat(stat)}
      >
        <Flex justify="between" align="start">
          <span className={styles.statIcon}>{icons[stat]}</span>
        </Flex>

        <div className={styles.statContent}>
          <div className={styles.statLabel}>
            {stat === 'str' ? 'STRENGTH' :
              stat === 'agi' ? 'AGILITY' :
                stat === 'pre' ? 'PRESENCE' : 'TOUGHNESS'}
          </div>
          <div className={styles.statValue}>
            {displayValue}
          </div>
        </div>

        {/* Hidden controls for editing could go here, or just rely on clicking to roll and maybe a long press/settings to edit? 
             For now, let's add small buttons at bottom right for editing or simple +/- overlay */}
        <div
          className={styles.controls}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => updateField(stat, value - 1)}
            className={styles.controlButton}
          >
            -
          </button>
          <button
            onClick={() => updateField(stat, value + 1)}
            className={styles.controlButton}
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {(['str', 'agi', 'pre', 'tou'] as Array<StatKey>).map(renderStat)}
    </div>
  )
}
