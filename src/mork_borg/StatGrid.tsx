import { type ChangeEvent } from 'react'
import NumericInput from '../components/NumericInput'
import { Button } from '../ui'
import type { Sheet } from './sheet'
import styles from './StatGrid.module.css'

type StatKey = keyof Sheet & keyof Sheet['statDice']

interface StatGridProps {
  sheet: Sheet
  statDiceErrors: Record<StatKey, string>
  updateField: (_stat: StatKey, _value: number) => void
  rollStat: (_stat: StatKey) => void
  setEditingStat: (_stat: StatKey) => void
}

export default function StatGrid({
  sheet,
  statDiceErrors,
  updateField,
  rollStat,
  setEditingStat
}: StatGridProps) {
  return (
    <div className={styles.grid}>
      {(['str', 'agi', 'pre', 'tou'] as Array<StatKey>).map(stat => (
        <div key={stat} className={styles.stat}>
          <label>
            {stat.toUpperCase()}
            <div className={styles.controls}>
              <NumericInput
                value={sheet[stat]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField(stat, Number(e.target.value))
                }
              />
              <Button
                type="button"
                icon="dice"
                onClick={() => rollStat(stat)}
                aria-label="Roll"
                className={styles.iconButton}
              />
              <Button
                type="button"
                icon="edit"
                onClick={() => setEditingStat(stat)}
                aria-label="Edit notation"
                className={`${styles.iconButton} ${styles.edit}`}
              />
            </div>
          </label>
          {statDiceErrors[stat] && (
            <span className="error-message">{statDiceErrors[stat]}</span>
          )}
        </div>
      ))}
    </div>
  )
}
