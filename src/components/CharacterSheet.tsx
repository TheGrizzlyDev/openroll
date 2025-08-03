import { useState, type ChangeEvent } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from '../GameContext'
import NumericInput from './NumericInput'
import classes from '../data/classes'

export default function CharacterSheet() {
  const { sheet, setSheet, roll } = useGameContext()
  const [statDiceErrors, setStatDiceErrors] = useState<Record<string, string>>({
    str: '',
    agi: '',
    pre: '',
    tou: ''
  })

  const updateField = (field: string, value: any) =>
    setSheet((prev: any) => ({ ...prev, [field]: value }))

  const updateStatDice = (stat: string, value: any) =>
    setSheet((prev: any) => ({
      ...prev,
      statDice: { ...prev.statDice, [stat]: value }
    }))

  const rollStat = (stat: string) => {
    const mod = Number(sheet[stat]) || 0
    const notation = sheet.statDice[stat] || '1d20'
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    try {
      Parser.parse(fullNotation)
      roll(fullNotation, stat.toUpperCase())
    setStatDiceErrors((prev: Record<string, string>) => ({ ...prev, [stat]: '' }))
    } catch {
      setStatDiceErrors((prev: Record<string, string>) => ({ ...prev, [stat]: 'Invalid notation' }))
    }
  }

  return (
    <div className="sheet">
      <label>
        Character
        <input value={sheet.name} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)} />
      </label>
      <label>
        Class
        <select value={sheet.class} onChange={(e: ChangeEvent<HTMLSelectElement>) => updateField('class', e.target.value)}>
          <option value="">No class</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </label>

      <div className="stats">
        {['str', 'agi', 'pre', 'tou'].map(stat => (
          <div key={stat} className="stat">
            <label>
              {stat.toUpperCase()}
              <NumericInput
                value={sheet[stat]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(stat, e.target.value)}
              />
            </label>
            <input
              value={sheet.statDice[stat]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                updateStatDice(stat, e.target.value)
                setStatDiceErrors(prev => ({ ...prev, [stat]: '' }))
              }}
              placeholder="1d20"
              className={statDiceErrors[stat] ? 'error' : ''}
            />
            {statDiceErrors[stat] && (
              <span className="error-message">{statDiceErrors[stat]}</span>
            )}
            <button onClick={() => rollStat(stat)}>Roll</button>
          </div>
        ))}
      </div>

      <label>
        HP
        <NumericInput value={sheet.hp} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('hp', e.target.value)} min={0} />
      </label>
      <label>
        Max HP
        <NumericInput value={sheet.maxHp} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('maxHp', e.target.value)} min={0} />
      </label>
      <label>
        Armor
        <NumericInput value={sheet.armor} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('armor', e.target.value)} min={0} />
      </label>
      <label>
        Omens
        <NumericInput value={sheet.omens} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('omens', e.target.value)} min={0} />
      </label>
      <label>
        Silver
        <NumericInput value={sheet.silver} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('silver', e.target.value)} min={0} />
      </label>
      <label>
        Notes
        <textarea rows={4} value={sheet.notes} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('notes', e.target.value)} />
      </label>
    </div>
  )
}
