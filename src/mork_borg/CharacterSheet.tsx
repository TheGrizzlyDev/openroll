import { type ChangeEvent } from 'react'
import { useGameContext } from '../stores/GameContext'
import {
  Input,
  Select,
  HpBar,
  FormField,
  NumericAttribute,
} from '../design-system'
import StatGrid from './StatGrid'
import classes from './classes'
import type { Sheet } from './sheet'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

export default function CharacterSheet() {
  const {
    state: { sheet },
    dispatch,
    roll
  } = useGameContext()
  const updateField = <K extends keyof Sheet>(field: K, value: Sheet[K]) =>
    dispatch({ type: 'SET_SHEET', sheet: { ...sheet, [field]: value } })

  const rollStat = (stat: StatKey, advantage = false) => {
    const mod = Number(sheet[stat]) || 0
    const notation = advantage ? '2d20kh1' : '1d20'
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    roll(fullNotation, stat.toUpperCase())
  }

  return (
    <div className="sheet">
      <HpBar
        hp={sheet.hp}
        tempHp={sheet.tempHp}
        maxHp={sheet.maxHp}
        onHpChange={val => updateField('hp', val)}
        onTempHpChange={val => updateField('tempHp', val)}
        onMaxHpChange={val => updateField('maxHp', val)}
      />

      <StatGrid sheet={sheet} updateField={updateField} rollStat={rollStat} />
      
      <FormField label="Character" htmlFor="character">
        <Input
          value={sheet.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
        />
      </FormField>
      <FormField label="Class" htmlFor="class">
        <Select
          value={sheet.class}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            updateField('class', e.target.value)
          }
        >
          <option value="">No class</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Trait" htmlFor="trait">
        <Input
          value={sheet.trait}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('trait', e.target.value)
          }
        />
      </FormField>
      <FormField label="Background" htmlFor="background">
        <Input
          value={sheet.background}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('background', e.target.value)
          }
        />
      </FormField>

      <div className="secondary-stats">
        <FormField label="Armor" htmlFor="armor">
          <NumericAttribute
            id="armor"
            value={sheet.armor}
            onChange={val => updateField('armor', val)}
            min={0}
          />
        </FormField>
        <FormField label="Omens" htmlFor="omens">
          <NumericAttribute
            id="omens"
            value={sheet.omens}
            onChange={val => updateField('omens', val)}
            min={0}
          />
        </FormField>
        <FormField label="Silver" htmlFor="silver">
          <NumericAttribute
            id="silver"
            value={sheet.silver}
            onChange={val => updateField('silver', val)}
            min={0}
          />
        </FormField>
      </div>
    </div>
  )
}
