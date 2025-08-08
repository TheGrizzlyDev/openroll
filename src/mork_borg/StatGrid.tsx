import { type ChangeEvent } from 'react'
import { Stat } from '../design-system'
import type { Sheet } from './sheet'

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
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,_minmax(160px,_1fr))]">
      {(['str', 'agi', 'pre', 'tou'] as Array<StatKey>).map(stat => (
        <Stat
          key={stat}
          label={stat.toUpperCase()}
          value={sheet[stat]}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField(stat, Number(e.target.value))
          }
          onRoll={() => rollStat(stat)}
          onEdit={() => setEditingStat(stat)}
          error={statDiceErrors[stat]}
        />
      ))}
    </div>
  )
}
