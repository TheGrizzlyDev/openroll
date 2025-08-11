import { FormField, Stat } from '../design-system'
import type { Sheet } from './sheet'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

interface StatGridProps {
  sheet: Sheet
  updateField: (_stat: StatKey, _value: number) => void
  rollStat: (_stat: StatKey, _advantage?: boolean) => void
}

export default function StatGrid({
  sheet,
  updateField,
  rollStat,
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
          >
            <Stat
              id={id}
              value={sheet[stat]}
              onChange={value => updateField(stat, value)}
              onRoll={() => rollStat(stat)}
              onRollAdv={() => rollStat(stat, true)}
            />
          </FormField>
        )
      })}
    </div>
  )
}
