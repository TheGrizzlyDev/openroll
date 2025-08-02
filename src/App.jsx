import { useState } from 'react'
import DiceRoller from './DiceRoller'
import './App.css'

export default function App() {
  const [sheet, setSheet] = useState({
    name: '',
    class: '',
    str: 0,
    agi: 0,
    pre: 0,
    tou: 0,
    hp: 0,
    armor: 0,
    omens: 0,
    silver: 0,
    notes: ''
  })
  const [log, setLog] = useState([])

  const updateField = (field, value) => setSheet(prev => ({ ...prev, [field]: value }))

  const roll = (count, sides, mod = 0, label = '') => {
    const rolls = Array.from({ length: count }, () => Math.ceil(Math.random() * sides))
    const total = rolls.reduce((a, b) => a + b, 0) + mod
    const entry = { label, rolls, mod, total }
    setLog(prev => [entry, ...prev])
    return total
  }

  const rollStat = (stat) => {
    const mod = Number(sheet[stat]) || 0
    roll(1, 20, mod, stat.toUpperCase())
  }

  return (
    <div className="container">
      <h1>Open Roll</h1>
      <DiceRoller onRoll={roll} />

      <div className="sheet">
        <label>
          Character
          <input value={sheet.name} onChange={e => updateField('name', e.target.value)} />
        </label>
        <label>
          Class
          <input value={sheet.class} onChange={e => updateField('class', e.target.value)} />
        </label>

        <div className="stats">
          {['str', 'agi', 'pre', 'tou'].map(stat => (
            <div key={stat} className="stat">
              <label>
                {stat.toUpperCase()}
                <input
                  type="number"
                  value={sheet[stat]}
                  onChange={e => updateField(stat, e.target.value)}
                />
              </label>
              <button onClick={() => rollStat(stat)}>Roll</button>
            </div>
          ))}
        </div>

        <label>
          HP
          <input type="number" value={sheet.hp} onChange={e => updateField('hp', e.target.value)} />
        </label>
        <label>
          Armor
          <input type="number" value={sheet.armor} onChange={e => updateField('armor', e.target.value)} />
        </label>
        <label>
          Omens
          <input type="number" value={sheet.omens} onChange={e => updateField('omens', e.target.value)} />
        </label>
        <label>
          Silver
          <input type="number" value={sheet.silver} onChange={e => updateField('silver', e.target.value)} />
        </label>
        <label>
          Notes
          <textarea rows="4" value={sheet.notes} onChange={e => updateField('notes', e.target.value)} />
        </label>
      </div>

      <div className="log">
        <h2>Rolls</h2>
        <ul>
          {log.map((entry, idx) => (
            <li key={idx}>
              {entry.label ? `${entry.label}: ` : ''}
              {entry.rolls.join(', ')}{entry.mod ? (entry.mod > 0 ? ` +${entry.mod}` : ` ${entry.mod}`) : ''} = {entry.total}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
