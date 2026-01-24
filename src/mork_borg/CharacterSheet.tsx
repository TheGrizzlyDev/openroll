import React, { useState } from 'react'
import { RenderOml } from '../oml/render'
import { useGameContext } from '../stores/GameContext'
import type { Sheet } from './sheet'
import styles from './CharacterSheet.module.css'
import { MorkBorgOmlButton } from './MorkBorgOmlButton'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

export default function CharacterSheet() {
  const {
    state: { sheet, inventory },
    dispatch,
    roll
  } = useGameContext()

  const [vitalityFocus, setVitalityFocus] = useState<'hp' | 'maxHp'>('hp')
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [isArmorOverlayOpen, setIsArmorOverlayOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [editingStat, setEditingStat] = useState<StatKey | null>(null)
  const [tempStatValue, setTempStatValue] = useState<string>('')

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
        <div className={styles.charClassContainer}>
          <span className={styles.charClass}>{sheet.class || 'GUTTER BORN SCUM'}</span>
        </div>
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
              <div className={styles.gearInfo} style={{ width: '100%' }}>
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
                  <div style={{ flex: 1 }}>
                    <h4>{item.name}</h4>
                    <div className={styles.gearDescription}>
                      {RenderOml(item.notes || '', roll, { Button: MorkBorgOmlButton })}
                    </div>
                  </div>
                )}
              </div>
              {editingItemId !== item.id && (
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
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
              )}
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
          <div style={{
            background: '#000',
            color: '#FFF',
            border: '8px solid #F7D02C',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '20px 20px 0 #F7D02C',
            textAlign: 'center'
          }}>
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
          <div style={{
            background: '#000',
            color: '#F7D02C',
            border: '8px solid #F7D02C',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '20px 20px 0 #F7D02C'
          }}>
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
            <button
              onClick={() => setIsArmorOverlayOpen(false)}
              style={{
                marginTop: '2.5rem',
                width: '100%',
                background: '#F7D02C',
                color: '#000',
                fontWeight: 950,
                fontSize: '1.25rem',
                padding: '1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
