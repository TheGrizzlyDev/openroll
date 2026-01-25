import React, { useState } from 'react'
import { RenderOml } from '../oml/render'
import { useGameContext } from '../stores/GameContext'
import type { Sheet } from './sheet'
import styles from './CharacterSheet.module.css'
import { MorkBorgOmlButton } from './MorkBorgOmlButton'
import classNames from './classes'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

export default function CharacterSheet() {
  const {
    state: { sheet, inventory, counters, log },
    dispatch,
    roll
  } = useGameContext()

  const [vitalityFocus, setVitalityFocus] = useState<'hp' | 'maxHp'>('hp')
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingCounterId, setEditingCounterId] = useState<number | null>(null)
  const [isArmorOverlayOpen, setIsArmorOverlayOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [newCounterName, setNewCounterName] = useState('')
  const [newCounterNotes, setNewCounterNotes] = useState('')
  const [newCounterTurns, setNewCounterTurns] = useState('1')
  const [editingStat, setEditingStat] = useState<StatKey | null>(null)
  const [tempStatValue, setTempStatValue] = useState<string>('')
  const [isClassOverlayOpen, setIsClassOverlayOpen] = useState(false)
  const [isRollLogOpen, setIsRollLogOpen] = useState(false)

  const updateField = <K extends keyof Sheet>(field: K, value: Sheet[K]) =>
    dispatch({ type: 'SET_SHEET', sheet: { ...sheet, [field]: value } })

  const rollStat = (stat: StatKey) => {
    const mod = Number(sheet[stat]) || 0
    const notation = mod ? `1d20${mod >= 0 ? `+${mod}` : mod}` : '1d20'
    roll(notation, stat.toUpperCase())
  }

  const handleVitalityChange = (delta: number) => {
    if (vitalityFocus === 'hp') {
      const nextHp = Math.max(0, sheet.hp + delta)
      updateField('hp', Math.min(nextHp, sheet.maxHp))
    } else {
      const nextMax = Math.max(1, sheet.maxHp + delta)
      updateField('maxHp', nextMax)
      // If decreasing maxHp makes it lower than current hp, capped current hp is handled by state usually but let's be explicit
      if (sheet.hp > nextMax) {
        updateField('hp', nextMax)
      }
    }
  }

  const handleRollOmens = () => {
    const { total } = roll('1d2', 'OMENS')
    updateField('omens', total)
  }

  const handleAddItem = () => {
    if (!newItemName) return
    const newItem = {
      id: Date.now(),
      name: newItemName,
      qty: 1,
      notes: newItemNotes
    }
    dispatch({ type: 'SET_INVENTORY', inventory: [...inventory, newItem] })
    setNewItemName('')
    setNewItemNotes('')
  }

  const handleDeleteItem = (id: number) => {
    dispatch({ type: 'SET_INVENTORY', inventory: inventory.filter(i => i.id !== id) })
  }

  const handleUpdateItemNotes = (id: number, notes: string) => {
    dispatch({
      type: 'SET_INVENTORY',
      inventory: inventory.map(i => i.id === id ? { ...i, notes } : i)
    })
  }

  const handleAddCounter = () => {
    if (!newCounterName) return
    const turns = Math.max(0, Number(newCounterTurns) || 0)
    const newCounter = {
      id: Date.now(),
      name: newCounterName,
      turns,
      notes: newCounterNotes
    }
    dispatch({ type: 'SET_COUNTERS', counters: [...counters, newCounter] })
    setNewCounterName('')
    setNewCounterNotes('')
    setNewCounterTurns('1')
  }

  const handleDeleteCounter = (id: number) => {
    dispatch({ type: 'SET_COUNTERS', counters: counters.filter(c => c.id !== id) })
  }

  const handleUpdateCounterNotes = (id: number, notes: string) => {
    dispatch({
      type: 'SET_COUNTERS',
      counters: counters.map(c => c.id === id ? { ...c, notes } : c)
    })
  }

  const handleUpdateCounterTurns = (id: number, turns: number) => {
    dispatch({
      type: 'SET_COUNTERS',
      counters: counters.map(c => c.id === id ? { ...c, turns: Math.max(0, turns) } : c)
    })
  }

  const handleDecrementAllCounters = () => {
    dispatch({
      type: 'SET_COUNTERS',
      counters: counters.map(c => ({ ...c, turns: Math.max(0, c.turns - 1) }))
    })
  }

  const stats: { key: StatKey; label: string }[] = [
    { key: 'str', label: 'STR' },
    { key: 'agi', label: 'AGI' },
    { key: 'pre', label: 'PRE' },
    { key: 'tou', label: 'TOU' },
  ]

  const armors = [
    { name: 'None', die: '-', tier: 0 },
    { name: 'Tier 1 Gambeson', die: 'D2', tier: 1 },
    { name: 'Tier 2 Mail', die: 'D4', tier: 2 },
    { name: 'Tier 3 Plate', die: 'D6', tier: 3 },
  ]

  const currentArmor = armors.find(a => a.tier === sheet.armor) || armors[0]
  const currentClassName = sheet.class || 'Gutterborn Scum'
  const rollEntries = log.filter(entry => entry.notation)

  return (
    <div className={styles.sheet}>
      {/* Identity Section */}
      <div className={styles.identitySection}>
        <div className={styles.nameContainer}>
          <input
            className={styles.charName}
            value={sheet.name || ''}
            placeholder="NAME"
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.charClassContainer}
          onClick={() => setIsClassOverlayOpen(true)}
        >
          <span className={styles.charClass}>{currentClassName}</span>
          <span className={styles.charClassAction}>Change</span>
        </button>
      </div>

      {/* Vitality Block */}
      <div className={styles.vitalityBlock}>
        <button className={styles.minimalButton} onClick={() => handleVitalityChange(-1)}>−</button>
        <div className={styles.vitalityMain}>
          <div className={styles.vitalityValues}>
            <span
              className={`${styles.currentHp} ${vitalityFocus === 'hp' ? styles.focused : ''}`}
              onClick={() => setVitalityFocus('hp')}
            >
              {sheet.hp}
            </span>
            /
            <span
              className={`${styles.maxHp} ${vitalityFocus === 'maxHp' ? styles.focused : ''}`}
              onClick={() => setVitalityFocus('maxHp')}
            >
              {sheet.maxHp}
            </span>
          </div>
        </div>
        <button className={styles.minimalButton} onClick={() => handleVitalityChange(1)}>+</button>
      </div>

      {/* Armor Card */}
      <div className={styles.armorCard}>
        <div className={styles.armorMain} onClick={() => setIsArmorOverlayOpen(true)}>
          <div className={styles.armorInfo}>
            <h3>Armor</h3>
            <p>{currentArmor.name}</p>
          </div>
          <div className={styles.armorDie}>{currentArmor.die}</div>
        </div>
        {currentArmor.tier > 0 && (
          <button
            className={styles.armorRollBtn}
            onClick={(e) => {
              e.stopPropagation()
              roll(`1${currentArmor.die.toLowerCase()}`, 'ARMOR')
            }}
          >
            ⚄
          </button>
        )}
      </div>

      <div className={styles.statsSection}>
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={styles.statBox}
          >
            <div className={styles.statMain} onClick={() => rollStat(stat.key)}>
              <span className={styles.statLabel}>
                {stat.label}
              </span>
              <div className={styles.statRollAction}>
                <span className={styles.statMod}>
                  {sheet[stat.key] >= 0 ? `+${sheet[stat.key]}` : sheet[stat.key]}
                </span>
                <span className={styles.statRollIcon}>
                  ROLL D20 ⚄
                </span>
              </div>
            </div>
            <button
              className={styles.statEditBtn}
              onClick={(e) => {
                e.stopPropagation()
                setEditingStat(stat.key)
                setTempStatValue(sheet[stat.key].toString())
              }}
            >
              ✎
            </button>
          </div>
        ))}
      </div>

      {/* Omens */}
      <div className={styles.omensSection}>
        <div className={styles.omensTitle}>Omens</div>
        <div className={styles.omensCount}>{sheet.omens}</div>
        {sheet.omens > 0 ? (
          <button
            className={styles.omensButton}
            onClick={() => updateField('omens', Math.max(0, sheet.omens - 1))}
          >
            USE OMEN
          </button>
        ) : (
          <button
            className={styles.omensButton}
            onClick={handleRollOmens}
          >
            ROLL 1d2 OMENS
          </button>
        )}
      </div>

      {/* Gear */}
      <div className={styles.gearSection}>
        <div className={styles.gearTitle}>Gear</div>
        <div className={styles.gearList}>
          {inventory.map((item) => (
            <div key={item.id} className={styles.gearItem}>
              <div className={styles.gearInfo}>
                {editingItemId === item.id ? (
                  <div onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
                    <input
                      value={item.name}
                      onChange={(e) => {
                        dispatch({
                          type: 'SET_INVENTORY',
                          inventory: inventory.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                        })
                      }}
                      style={{
                        width: '100%',
                        background: '#FFF',
                        border: '4px solid #000',
                        padding: '0.75rem',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        fontFamily: 'inherit',
                        color: '#000'
                      }}
                    />
                    <textarea
                      value={item.notes}
                      onChange={(e) => handleUpdateItemNotes(item.id, e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        background: '#FFF',
                        border: '4px solid #000',
                        marginTop: '0.5rem',
                        fontFamily: 'inherit',
                        padding: '1rem',
                        fontWeight: 700,
                        color: '#000'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => setEditingItemId(null)}
                        style={{
                          flex: 1,
                          background: '#F7D02C',
                          color: '#000',
                          fontWeight: 950,
                          padding: '0.75rem',
                          border: '4px solid #000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          color: '#000',
                          border: '4px solid #000',
                          fontWeight: 950,
                          padding: '0.75rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={styles.gearHeader}>
                      <h4>{item.name}</h4>
                      <div className={styles.gearActions}>
                        <button
                          className={styles.gearEditBtn}
                          onClick={() => setEditingItemId(item.id)}
                        >
                          ✎
                        </button>
                        <button
                          className={styles.gearRemoveBtn}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <div className={styles.gearDescription}>
                      {RenderOml(item.notes || '', roll, { Button: MorkBorgOmlButton })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Inline Add Gear Form */}
        <div style={{ marginTop: '2rem', border: '5px solid #000', padding: '1.5rem', background: '#000', color: '#F7D02C' }}>
          <h3 style={{ textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 950 }}>Add Equipment</h3>
          <input
            type="text"
            placeholder="ITEM NAME"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{
              width: '100%',
              background: '#000',
              border: '3px solid #F7D02C',
              color: '#F7D02C',
              padding: '1rem',
              boxSizing: 'border-box',
              fontWeight: 700,
              marginBottom: '1rem'
            }}
          />
          <textarea
            placeholder="DESCRIPTION / NOTES"
            value={newItemNotes}
            onChange={(e) => setNewItemNotes(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              background: '#000',
              border: '3px solid #F7D02C',
              color: '#F7D02C',
              padding: '1rem',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              fontWeight: 700,
              marginBottom: '1rem'
            }}
          />
          <button
            onClick={handleAddItem}
            style={{
              width: '100%',
              background: '#F7D02C',
              color: '#000',
              fontWeight: 950,
              height: '3.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ADD TO INVENTORY
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className={styles.counterSection}>
        <div className={styles.counterTitle}>Counters</div>
        <div className={styles.counterList}>
          {counters.map((counter) => (
            <div key={counter.id} className={styles.counterItem}>
              <div className={styles.counterInfo}>
                {editingCounterId === counter.id ? (
                  <div className={styles.counterEditForm}>
                    <input
                      value={counter.name}
                      onChange={(e) => {
                        dispatch({
                          type: 'SET_COUNTERS',
                          counters: counters.map(c => c.id === counter.id ? { ...c, name: e.target.value } : c)
                        })
                      }}
                      className={styles.counterEditName}
                    />
                    <textarea
                      value={counter.notes}
                      onChange={(e) => handleUpdateCounterNotes(counter.id, e.target.value)}
                      className={styles.counterEditNotes}
                    />
                    <div className={styles.counterEditActions}>
                      <button
                        type="button"
                        onClick={() => setEditingCounterId(null)}
                        className={styles.counterSaveButton}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCounterId(null)}
                        className={styles.counterCancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={styles.counterHeader}>
                      <h4>{counter.name}</h4>
                      <div className={styles.counterMeta}>
                        <input
                          aria-label={`${counter.name} turns`}
                          className={styles.counterTurnsInput}
                          type="number"
                          min={0}
                          value={counter.turns}
                          onChange={(e) => handleUpdateCounterTurns(counter.id, Number(e.target.value))}
                        />
                        <div className={styles.counterActions}>
                          <button
                            type="button"
                            className={styles.counterEditBtn}
                            onClick={() => setEditingCounterId(counter.id)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className={styles.counterRemoveBtn}
                            onClick={() => handleDeleteCounter(counter.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.counterDescription}>
                      {RenderOml(counter.notes || '', roll, { Button: MorkBorgOmlButton })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={styles.counterDecrementButton}
          onClick={handleDecrementAllCounters}
        >
          Decrement All Counters
        </button>

        <div className={styles.counterForm}>
          <h3 className={styles.counterFormTitle}>Add Counter</h3>
          <input
            type="text"
            placeholder="COUNTER NAME"
            value={newCounterName}
            onChange={(e) => setNewCounterName(e.target.value)}
            className={styles.counterInput}
          />
          <div className={styles.counterTurnsRow}>
            <label className={styles.counterTurnsLabel} htmlFor="counter-turns-input">
              Turns
            </label>
            <input
              id="counter-turns-input"
              type="number"
              min={0}
              value={newCounterTurns}
              onChange={(e) => setNewCounterTurns(e.target.value)}
              className={styles.counterTurnsField}
            />
          </div>
          <textarea
            placeholder="DESCRIPTION / NOTES"
            value={newCounterNotes}
            onChange={(e) => setNewCounterNotes(e.target.value)}
            className={styles.counterTextarea}
          />
          <button
            type="button"
            onClick={handleAddCounter}
            className={styles.counterSubmit}
          >
            Add Counter
          </button>
        </div>
      </div>

      {/* Stat Edit Overlay */}
      {editingStat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.9)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className={styles.overlayCard} style={{
            background: '#000',
            color: '#FFF',
            border: '8px solid #F7D02C',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '20px 20px 0 #F7D02C',
            textAlign: 'center'
          }}>
            <button
              type="button"
              className={styles.overlayCloseButton}
              aria-label="Close stat editor"
              onClick={() => setEditingStat(null)}
            >
              ×
            </button>
            <h2 style={{ textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 950, fontSize: '2rem', color: '#F7D02C' }}>
              Edit {stats.find(s => s.key === editingStat)?.label}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setTempStatValue((parseInt(tempStatValue) - 1).toString())}
                style={{ background: '#F7D02C', border: 'none', color: '#000', fontSize: '2rem', fontWeight: 950, padding: '0.5rem 1.5rem', cursor: 'pointer' }}
              >
                -
              </button>
              <input
                type="number"
                value={tempStatValue}
                onChange={(e) => setTempStatValue(e.target.value)}
                style={{
                  width: '100px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '3rem',
                  fontWeight: 950,
                  textAlign: 'center',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => setTempStatValue((parseInt(tempStatValue) + 1).toString())}
                style={{ background: '#F7D02C', border: 'none', color: '#000', fontSize: '2rem', fontWeight: 950, padding: '0.5rem 1.5rem', cursor: 'pointer' }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  updateField(editingStat, parseInt(tempStatValue) || 0)
                  setEditingStat(null)
                }}
                style={{
                  flex: 1,
                  background: '#F7D02C',
                  color: '#000',
                  fontWeight: 950,
                  fontSize: '1.25rem',
                  padding: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                SAVE
              </button>
              <button
                onClick={() => setEditingStat(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#F7D02C',
                  border: '4px solid #F7D02C',
                  fontWeight: 950,
                  fontSize: '1.25rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.rollLogSection}>
        <button
          type="button"
          className={styles.rollLogButton}
          onClick={() => setIsRollLogOpen(true)}
        >
          Roll Log
        </button>
      </div>

      {/* Simple Armor Selection Overlay */}
      {isArmorOverlayOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.9)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className={styles.overlayCard} style={{
            background: '#000',
            color: '#F7D02C',
            border: '8px solid #F7D02C',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '20px 20px 0 #F7D02C'
          }}>
            <button
              type="button"
              className={styles.overlayCloseButton}
              aria-label="Close armor selector"
              onClick={() => setIsArmorOverlayOpen(false)}
            >
              ×
            </button>
            <h2 style={{ textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 950, fontSize: '2rem' }}>Select Armor</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {armors.map(a => (
                <button
                  key={a.tier}
                  onClick={() => {
                    updateField('armor', a.tier)
                    setIsArmorOverlayOpen(false)
                  }}
                  style={{
                    background: 'transparent',
                    border: '4px solid #F7D02C',
                    color: '#F7D02C',
                    padding: '1.5rem',
                    fontSize: '1.25rem',
                    fontWeight: 950,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {a.name} ({a.die})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class Selection Overlay */}
      {isClassOverlayOpen && (
        <div className={styles.classOverlay}>
          <div className={styles.classOverlayCard}>
            <h2 className={styles.classOverlayTitle}>Select Class</h2>
            <button
              type="button"
              className={styles.overlayCloseButton}
              aria-label="Close class selector"
              onClick={() => setIsClassOverlayOpen(false)}
            >
              ×
            </button>
            <div className={styles.classOptionList}>
              {classNames.map(className => (
                <button
                  key={className}
                  type="button"
                  onClick={() => {
                    updateField('class', className)
                    setIsClassOverlayOpen(false)
                  }}
                  className={styles.classOptionButton}
                  data-selected={currentClassName === className}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isRollLogOpen && (
        <div className={styles.rollLogOverlay} role="dialog" aria-modal="true">
          <div className={styles.rollLogCard}>
            <button
              type="button"
              className={styles.overlayCloseButton}
              aria-label="Close roll log"
              onClick={() => setIsRollLogOpen(false)}
            >
              ×
            </button>
            <h2 className={styles.rollLogTitle}>Roll Log</h2>
            {rollEntries.length === 0 ? (
              <p className={styles.rollLogEmpty}>No rolls yet.</p>
            ) : (
              <ul className={styles.rollLogList}>
                {rollEntries.map((entry, index) => (
                  <li key={`${entry.label}-${entry.notation}-${index}`} className={styles.rollLogItem}>
                    <div className={styles.rollLogHeader}>
                      <span className={styles.rollLogLabel}>
                        {entry.label || 'Roll'}
                      </span>
                      <span className={styles.rollLogNotation}>{entry.notation}</span>
                    </div>
                    <div className={styles.rollLogOutput}>{entry.output}</div>
                    {typeof entry.total === 'number' ? (
                      <div className={styles.rollLogTotal}>Total: {entry.total}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
