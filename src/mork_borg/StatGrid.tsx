import { FormField, Stat } from '../design-system'
import type { Sheet } from './sheet'

type StatKey = keyof Sheet & keyof Sheet['statDice']

interface StatGridProps {
  sheet: Sheet
  statDiceErrors: Record<StatKey, string>
  updateField: (_stat: StatKey, _value: number) => void
  rollStat: (_stat: StatKey, _advantage?: boolean) => void
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
    <div className="flex flew-row flex-wrap justify-between">
      {(['str', 'agi', 'pre', 'tou'] as Array<StatKey>).map(stat => {
        const id = `stat-${stat}`
        return (
          <FormField
            key={stat}
            label={stat.toUpperCase()}
            htmlFor={id}
            error={statDiceErrors[stat]}
          >
            <Stat
              id={id}
              value={sheet[stat]}
              onChange={value => updateField(stat, value)}
              onRoll={() => rollStat(stat)}
              onRollAdv={() => rollStat(stat, true)}
              onEdit={() => setEditingStat(stat)}
            />
          </FormField>
        )
      })}
    </div>
  )
}
