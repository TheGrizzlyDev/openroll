import { useState } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from '../GameContext'
import NumericInput from './NumericInput'
import classes from '../data/classes'

export default function CharacterSheet() {
  const { sheet, setSheet, roll } = useGameContext()
  const [statDiceErrors, setStatDiceErrors] = useState({
    str: '',
    agi: '',
    pre: '',
    tou: ''
  })

  const updateField = (field, value) =>
    setSheet(prev => ({ ...prev, [field]: value }))

  const updateStatDice = (stat, value) =>
    setSheet(prev => ({
      ...prev,
      statDice: { ...prev.statDice, [stat]: value }
    }))

  const rollStat = (stat) => {
    const mod = Number(sheet[stat]) || 0
    const notation = sheet.statDice[stat] || '1d20'
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    try {
      Parser.parse(fullNotation)
      roll(fullNotation, stat.toUpperCase())
      setStatDiceErrors(prev => ({ ...prev, [stat]: '' }))
    } catch {
      setStatDiceErrors(prev => ({ ...prev, [stat]: 'Invalid notation' }))
    }
  }

  return (
    <div className="sheet">
      <label>
        Character
        <input value={sheet.name} onChange={e => updateField('name', e.target.value)} />
      </label>
      <label>
        Class
        <select value={sheet.class} onChange={e => updateField('class', e.target.value)}>
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
                onChange={e => updateField(stat, e.target.value)}
              />
            </label>
            <input
              value={sheet.statDice[stat]}
              onChange={e => {
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
        <NumericInput value={sheet.hp} onChange={e => updateField('hp', e.target.value)} min={0} />
      </label>
      <label>
        Max HP
        <NumericInput value={sheet.maxHp} onChange={e => updateField('maxHp', e.target.value)} min={0} />
      </label>
      <label>
        Armor
        <NumericInput value={sheet.armor} onChange={e => updateField('armor', e.target.value)} min={0} />
      </label>
      <label>
        Omens
        <NumericInput value={sheet.omens} onChange={e => updateField('omens', e.target.value)} min={0} />
      </label>
      <label>
        Silver
        <NumericInput value={sheet.silver} onChange={e => updateField('silver', e.target.value)} min={0} />
      </label>
      <label>
        Notes
        <textarea rows="4" value={sheet.notes} onChange={e => updateField('notes', e.target.value)} />
      </label>
    </div>
  )
}
