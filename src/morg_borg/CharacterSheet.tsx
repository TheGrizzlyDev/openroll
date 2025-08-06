import { useState, type ChangeEvent } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from '../GameContext'
import NumericInput from '../components/NumericInput'
import SmartTextEditor from '../components/SmartTextEditor'
import { Select } from '../ui/Select'
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

  const updateField = <K extends keyof Sheet>(field: K, value: Sheet[K]) =>
    dispatch({ type: 'SET_SHEET', sheet: { ...sheet, [field]: value } })

  const updateStatDice = (stat: StatKey, value: string) =>
    dispatch({
      type: 'SET_SHEET',
      sheet: { ...sheet, statDice: { ...sheet.statDice, [stat]: value } }
    })

  const rollStat = (stat: StatKey) => {
    const mod = Number(sheet[stat]) || 0
    const notation = sheet.statDice[stat] || '1d20'
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    try {
      Parser.parse(fullNotation)
      roll(fullNotation, stat.toUpperCase())
      setStatDiceErrors((prev: Record<StatKey, string>) => ({ ...prev, [stat]: '' }))
    } catch {
      setStatDiceErrors((prev: Record<StatKey, string>) => ({ ...prev, [stat]: 'Invalid notation' }))
    }
  }

  return (
    <div className="sheet">
      <label>
        Character
        <input className="base-input" value={sheet.name} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)} />
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
        <input
          className="base-input"
          value={sheet.trait}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('trait', e.target.value)
          }
        />
      </label>
      <label>
        Background
        <input
          className="base-input"
          value={sheet.background}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('background', e.target.value)
          }
        />
      </label>

      <div className="stats">
        {(['str', 'agi', 'pre', 'tou'] as Array<StatKey>).map(stat => (
          <div key={stat} className="stat">
            <label>
              {stat.toUpperCase()}
              <NumericInput
                value={sheet[stat]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField(stat, Number(e.target.value))
                }
              />
            </label>
            <input
              className={statDiceErrors[stat] ? 'base-input error' : 'base-input'}
              value={sheet.statDice[stat]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                updateStatDice(stat, e.target.value)
                setStatDiceErrors(prev => ({ ...prev, [stat]: '' }))
              }}
              placeholder="1d20"
            />
            {statDiceErrors[stat] && (
              <span className="error-message">{statDiceErrors[stat]}</span>
            )}
            <button className="base-button" onClick={() => rollStat(stat)}>Roll</button>
          </div>
        ))}
      </div>

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
      <label>
        Notes
        <SmartTextEditor
          value={sheet.notes}
          onChange={value => updateField('notes', value)}
        />
      </label>
    </div>
  )
}
