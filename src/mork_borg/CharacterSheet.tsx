import { useState, type ChangeEvent } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from '../GameContext'
import NumericInput from '../components/NumericInput'
import Popup from '../components/Popup'
import { Input, Select } from '../design-system'
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

  const rollStat = (stat: StatKey) => {
    const mod = Number(sheet[stat]) || 0
    const notation = statDiceValues[stat] || '1d20'
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
      <label>
        Character
        <Input value={sheet.name} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)} />
      </label>
      <label>
        Class
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
      </label>

      <label>
        Trait
        <Input
          value={sheet.trait}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('trait', e.target.value)
          }
        />
      </label>
      <label>
        Background
        <Input
          value={sheet.background}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('background', e.target.value)
          }
        />
      </label>

      <StatGrid
        sheet={sheet}
        statDiceErrors={statDiceErrors}
        updateField={updateField}
        rollStat={rollStat}
        setEditingStat={handleSetEditingStat}
      />

      <Popup visible={editingStat !== null} onClose={() => setEditingStat(null)}>
        {editingStat && (
          <>
            <Input
              className={statDiceErrors[editingStat] ? 'error' : undefined}
              value={statDiceValues[editingStat]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                updateStatDice(editingStat, e.target.value)
                setStatDiceErrors(prev => ({ ...prev, [editingStat]: '' }))
              }}
              placeholder="1d20"
            />
            {statDiceErrors[editingStat] && (
              <span className="error-message">{statDiceErrors[editingStat]}</span>
            )}
          </>
        )}
      </Popup>

      <label>
        HP
        <NumericInput
          value={sheet.hp}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('hp', Number(e.target.value))
          }
          min={0}
        />
      </label>
      <label>
        Max HP
        <NumericInput
          value={sheet.maxHp}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('maxHp', Number(e.target.value))
          }
          min={0}
        />
      </label>
      <div className="secondary-stats">
        <label>
          Armor
          <NumericInput
            value={sheet.armor}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('armor', Number(e.target.value))
            }
            min={0}
          />
        </label>
        <label>
          Omens
          <NumericInput
            value={sheet.omens}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('omens', Number(e.target.value))
            }
            min={0}
          />
        </label>
        <label>
          Silver
          <NumericInput
            value={sheet.silver}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('silver', Number(e.target.value))
            }
            min={0}
          />
        </label>
      </div>
    </div>
  )
}
