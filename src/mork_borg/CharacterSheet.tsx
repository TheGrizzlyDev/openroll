import React, { useState } from 'react'
import { useGameContext } from '../stores/GameContext'
import type { Sheet } from './sheet'
import styles from './CharacterSheet.module.css'
import SmartTextEditor from '../components/SmartTextEditor'
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
  Button,
} from '../components/ui'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

export default function CharacterSheet() {
  const {
    state: { sheet, inventory },
    dispatch,
    roll
  } = useGameContext()

  const [vitalityFocus, setVitalityFocus] = useState<'hp' | 'maxHp'>('hp')
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isArmorOverlayOpen, setIsArmorOverlayOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')

  const updateField = <K extends keyof Sheet>(field: K, value: Sheet[K]) =>
    dispatch({ type: 'SET_SHEET', sheet: { ...sheet, [field]: value } })

  const rollStat = (stat: StatKey) => {
    const mod = Number(sheet[stat]) || 0
    const notation = mod ? `1d20${mod >= 0 ? `+${mod}` : mod}` : '1d20'
    roll(notation, stat.toUpperCase())
  }

  const handleVitalityChange = (delta: number) => {
    if (vitalityFocus === 'hp') {
      updateField('hp', Math.max(0, sheet.hp + delta))
    } else {
      updateField('maxHp', Math.max(1, sheet.maxHp + delta))
    }
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
    setIsAddingItem(false)
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
    { key: 'str', label: 'Strength' },
    { key: 'agi', label: 'Agility' },
    { key: 'pre', label: 'Presence' },
    { key: 'tou', label: 'Toughness' },
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
        <input
          className={styles.charName}
          value={sheet.name || ''}
          placeholder="NAME"
          onChange={(e) => updateField('name', e.target.value)}
        />
        <div className={styles.charClassContainer}>
          <span className={styles.charClass}>{sheet.class || 'GUTTER BORN SCUM'}</span>
        </div>
      </div>

      {/* Vitality Block */}
      <div className={styles.vitalityBlock}>
        <span className={styles.vitalityLabel}>Vitality</span>
        <div className={styles.vitalityValues}>
          <span
            className={`${styles.currentHp} ${vitalityFocus === 'hp' ? styles.focused : ''}`}
            onClick={() => setVitalityFocus('hp')}
          >
            {sheet.hp.toString().padStart(2, '0')}
          </span>
          <span
            className={`${styles.maxHp} ${vitalityFocus === 'maxHp' ? styles.focused : ''}`}
            onClick={() => setVitalityFocus('maxHp')}
          >
            /{sheet.maxHp}
          </span>
        </div>
        <div className={styles.vitalityControls}>
          <button className={styles.controlButton} onClick={() => handleVitalityChange(-1)}>-</button>
          <button className={styles.controlButton} onClick={() => handleVitalityChange(1)}>+</button>
        </div>
      </div>

      {/* Armor Card */}
      <div className={styles.armorCard} onClick={() => setIsArmorOverlayOpen(true)}>
        <div className={styles.armorInfo}>
          <h3>Armor</h3>
          <p>{currentArmor.name}</p>
        </div>
        <div className={styles.armorDie}>{currentArmor.die}</div>
      </div>

      {/* Core Stats */}
      <div className={styles.statsSection}>
        {stats.map((stat) => (
          <div
            key={stat.key}
            style={{
              background: '#FFFFFF',
              border: '3px solid #000000',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => rollStat(stat.key)}
          >
            <span style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>
              {stat.label}
            </span>
            <span style={{ fontSize: '2rem', fontWeight: 900 }}>
              {sheet[stat.key] >= 0 ? `+${sheet[stat.key]}` : sheet[stat.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Omens */}
      <div className={styles.omensSection}>
        <div className={styles.omensTitle}>Omens</div>
        <div className={styles.omensCount}>{sheet.omens}</div>
        <button
          className={styles.omensButton}
          onClick={() => updateField('omens', Math.max(0, sheet.omens - 1))}
        >
          {sheet.omens > 0 ? 'USE OMEN' : 'ROLL OMENS'}
        </button>
      </div>

      {/* Gear */}
      <div className={styles.gearSection}>
        <div className={styles.gearTitle}>Gear</div>
        <div className={styles.gearList}>
          {inventory.map((item) => (
            <div key={item.id} className={styles.gearItem}>
              <div className={styles.gearInfo} onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}>
                <h4>{item.name}</h4>
                {editingItemId === item.id ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <textarea
                      value={item.notes}
                      onChange={(e) => handleUpdateItemNotes(item.id, e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        background: '#FFF',
                        border: '2px solid #000',
                        marginTop: '0.5rem',
                        fontFamily: 'inherit',
                        padding: '0.5rem'
                      }}
                    />
                    <Button onClick={() => handleDeleteItem(item.id)} style={{ marginTop: '0.5rem', background: '#000', color: '#E61E8D', fontWeight: 900 }}>Delete Item</Button>
                  </div>
                ) : (
                  <p>{item.notes}</p>
                )}
              </div>
              <button
                className={styles.gearRoll}
                onClick={() => roll('1d8', item.name)}
              >
                🎲
              </button>
            </div>
          ))}
        </div>
        {/* Add Equipment moved here (below list) */}
        <button className={styles.addEquipmentBar} onClick={() => setIsAddingItem(true)}>
          + ADD EQUIPMENT
        </button>
      </div>

      {/* Armor Overlay */}
      {isArmorOverlayOpen && (
        <DialogRoot open={isArmorOverlayOpen} onOpenChange={setIsArmorOverlayOpen}>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent style={{ background: '#000', color: '#F7D02C', border: '5px solid #F7D02C', padding: '2rem' }}>
              <h2 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 900 }}>Select Armor</h2>
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
                      border: '2px solid #F7D02C',
                      color: '#F7D02C',
                      padding: '1rem',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {a.name} ({a.die})
                  </button>
                ))}
              </div>
              <DialogCloseTrigger asChild>
                <Button style={{ marginTop: '2rem', width: '100%', background: '#F7D02C', color: '#000', fontWeight: 900 }}>Close</Button>
              </DialogCloseTrigger>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}

      {/* Add Item Dialog */}
      {isAddingItem && (
        <DialogRoot open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent style={{ background: '#000', color: '#F7D02C', border: '5px solid #F7D02C', padding: '2rem' }}>
              <h2 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 900 }}>Add Gear</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="ITEM NAME"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#000',
                    border: '2px solid #F7D02C',
                    color: '#F7D02C',
                    padding: '1rem',
                    boxSizing: 'border-box',
                    fontWeight: 700
                  }}
                />
                <textarea
                  placeholder="DESCRIPTION / NOTES"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    background: '#000',
                    border: '2px solid #F7D02C',
                    color: '#F7D02C',
                    padding: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    fontWeight: 700
                  }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button onClick={handleAddItem} style={{ flex: 1, background: '#F7D02C', color: '#000', fontWeight: 900, height: '3rem' }}>ADD</Button>
                  <Button onClick={() => setIsAddingItem(false)} style={{ flex: 1, background: 'transparent', border: '2px solid #F7D02C', color: '#F7D02C', fontWeight: 900, height: '3rem' }}>CANCEL</Button>
                </div>
              </div>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}
    </div>
  )
}
