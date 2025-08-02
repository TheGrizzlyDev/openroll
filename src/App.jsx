import { useRef, useState } from 'react'
import { DiceRoller as DiceParser } from '@dice-roller/rpg-dice-roller'
import DiceRoller from './DiceRoller'
import Inventory from './Inventory'
import './App.css'

export default function App() {
  const [sheet, setSheet] = useState({
    name: '',
    class: '',
    str: 0,
    agi: 0,
    pre: 0,
    tou: 0,
    statDice: {
      str: '1d20',
      agi: '1d20',
      pre: '1d20',
      tou: '1d20'
    },
    hp: 0,
    armor: 0,
    omens: 0,
    silver: 0,
    notes: ''
  })
  const [inventory, setInventory] = useState([])
  const [log, setLog] = useState([])
  const [activeTab, setActiveTab] = useState('character')
  const [overlay, setOverlay] = useState({ message: '', visible: false })
  const overlayTimeout = useRef(null)

  const updateField = (field, value) => setSheet(prev => ({ ...prev, [field]: value }))
  const updateStatDice = (stat, value) =>
    setSheet(prev => ({ ...prev, statDice: { ...prev.statDice, [stat]: value } }))

  const roller = new DiceParser()

  const roll = (notation, label = '') => {
    const result = roller.roll(notation)
    const entry = { label, notation, output: result.output, total: result.total }
    setLog(prev => [entry, ...prev])
    const message = `${label ? `${label}: ` : ''}${result.output}`
    setOverlay({ message, visible: true })
    clearTimeout(overlayTimeout.current)
    overlayTimeout.current = setTimeout(() => setOverlay(prev => ({ ...prev, visible: false })), 10000)
    return result.total
  }

  const rollStat = (stat) => {
    const mod = Number(sheet[stat]) || 0
    const notation = sheet.statDice[stat] || '1d20'
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    roll(fullNotation, stat.toUpperCase())
  }

  const logInventory = (message) => {
    setLog(prev => [{ label: 'Inventory', output: message }, ...prev])
  }

  return (
    <div className="container">
      <h1>Open Roll</h1>
      <DiceRoller onRoll={roll} />

      <div className="tabs">
        <button
          className={activeTab === 'character' ? 'active' : ''}
          onClick={() => setActiveTab('character')}
        >
          Character
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={activeTab === 'log' ? 'active' : ''}
          onClick={() => setActiveTab('log')}
        >
          Log
        </button>
      </div>

      {activeTab === 'character' && (
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
              <input
                value={sheet.statDice[stat]}
                onChange={e => updateStatDice(stat, e.target.value)}
                placeholder="1d20"
              />
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
      )}

      {activeTab === 'inventory' && (
        <Inventory items={inventory} onChange={setInventory} onLog={logInventory} />
      )}

      {activeTab === 'log' && (
      <div className="log">
        <h2>Rolls</h2>
        <ul>
          {log.map((entry, idx) => (
            <li key={idx}>
              {entry.label ? `${entry.label}: ` : ''}
              {entry.output}
            </li>
          ))}
        </ul>
      </div>
      )}
      <div className={`overlay${overlay.visible ? ' show' : ''}`}>
        <span>{overlay.message}</span>
        <button
          onClick={() => {
            clearTimeout(overlayTimeout.current)
            setOverlay(prev => ({ ...prev, visible: false }))
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
