import { useState, type ChangeEvent } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from '../GameContext'
import NumericInput from '../components/NumericInput'
import { Input, Select, HpBar, FormField, Dialog } from '../design-system'
import StatGrid from './StatGrid'
import classes from './classes'
import type { Sheet } from './sheet'

type StatKey = keyof Sheet & keyof Sheet['statDice'];

export default function CharacterSheet() {
  const {
    state: { sheet },
    dispatch,
    roll
  } = useGameContext()
  const [statDiceErrors, setStatDiceErrors] = useState<
    Record<StatKey, string>
  >({
    str: '',
    agi: '',
    pre: '',
    tou: ''
  })
  const [statDiceValues, setStatDiceValues] = useState<Record<StatKey, string>>({
    str: sheet.statDice.str || '1d20',
    agi: sheet.statDice.agi || '1d20',
    pre: sheet.statDice.pre || '1d20',
    tou: sheet.statDice.tou || '1d20'
  })
  const [editingStat, setEditingStat] = useState<StatKey | null>(null)

  const updateField = <K extends keyof Sheet>(field: K, value: Sheet[K]) =>
    dispatch({ type: 'SET_SHEET', sheet: { ...sheet, [field]: value } })

  const updateStatDice = (stat: StatKey, value: string) => {
    setStatDiceValues(prev => ({ ...prev, [stat]: value }))
    dispatch({
      type: 'SET_SHEET',
      sheet: { ...sheet, statDice: { ...sheet.statDice, [stat]: value } }
    })
  }

  const rollStat = (stat: StatKey, advantage = false) => {
    const mod = Number(sheet[stat]) || 0
    const base = statDiceValues[stat] || '1d20'
    const notation = advantage ? base.replace(/(\d+)?d(\d+)/, (_m, _n, sides) => `2d${sides}kh1`) : base
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    try {
      Parser.parse(fullNotation)
      roll(fullNotation, stat.toUpperCase())
      setStatDiceErrors((prev: Record<StatKey, string>) => ({ ...prev, [stat]: '' }))
    } catch {
      setStatDiceErrors((prev: Record<StatKey, string>) => ({ ...prev, [stat]: 'Invalid notation' }))
    }
  }

  const handleSetEditingStat = (stat: StatKey) => setEditingStat(stat)

  return (
    <div className="sheet">
      <HpBar
        hp={sheet.hp}
        maxHp={sheet.maxHp}
        onHpChange={val => updateField('hp', val)}
        onMaxHpChange={val => updateField('maxHp', val)}
      />

      <StatGrid
        sheet={sheet}
        statDiceErrors={statDiceErrors}
        updateField={updateField}
        rollStat={rollStat}
        setEditingStat={handleSetEditingStat}
      />
      
      <FormField label="Character" htmlFor="character">
        <Input
          id="character"
          value={sheet.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
        />
      </FormField>
      <FormField label="Class" htmlFor="class">
        <Select
          id="class"
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
          id="trait"
          value={sheet.trait}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('trait', e.target.value)
          }
        />
      </FormField>
      <FormField label="Background" htmlFor="background">
        <Input
          id="background"
          value={sheet.background}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('background', e.target.value)
          }
        />
      </FormField>

      <Dialog visible={editingStat !== null} onClose={() => setEditingStat(null)}>
        {editingStat && (
          <>
            <FormField
              label={`${editingStat.toUpperCase()} Dice`}
              htmlFor="stat-dice"
              error={statDiceErrors[editingStat]}
            >
              <Input
                id="stat-dice"
                className={statDiceErrors[editingStat] ? 'error' : undefined}
                value={statDiceValues[editingStat]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  updateStatDice(editingStat, e.target.value)
                  setStatDiceErrors(prev => ({ ...prev, [editingStat]: '' }))
                }}
                placeholder="1d20"
              />
            </FormField>
          </>
        )}
      </Dialog>
      <div className="secondary-stats">
        <FormField label="Armor" htmlFor="armor">
          <NumericInput
            id="armor"
            value={sheet.armor}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('armor', Number(e.target.value))
            }
            min={0}
          />
        </FormField>
        <FormField label="Omens" htmlFor="omens">
          <NumericInput
            id="omens"
            value={sheet.omens}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('omens', Number(e.target.value))
            }
            min={0}
          />
        </FormField>
        <FormField label="Silver" htmlFor="silver">
          <NumericInput
            id="silver"
            value={sheet.silver}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('silver', Number(e.target.value))
            }
            min={0}
          />
        </FormField>
      </div>
    </div>
  )
}
