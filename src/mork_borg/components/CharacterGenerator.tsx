import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { useGameContext } from '../../stores/GameContext'
import classes from '../classes'
import type { InventoryItem, Scroll } from '../generateCharacter'
import styles from './CharacterGenerator.module.css'

export default function CharacterGenerator() {
  const {
    state: { sheet, inventory, scrolls },
    createCharacter,
    finalizeCharacter,
    cancelCreation,
    dispatch
  } = useGameContext()
  const navigate = useNavigate()

  const handleConfirm = () => {
    const index = finalizeCharacter()
    navigate(`/sheet/${index}`)
  }

  const handleCancel = () => {
    cancelCreation()
    navigate('/roster')
  }

  const handleClassChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    createCharacter(value || undefined)
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_SHEET',
      sheet: { ...sheet, name: e.target.value }
    })
  }

  const handleRollStat = (stat: 'str' | 'agi' | 'pre' | 'tou') => {
    // Roll 3d6 and calculate modifier
    const roll1 = Math.floor(Math.random() * 6) + 1
    const roll2 = Math.floor(Math.random() * 6) + 1
    const roll3 = Math.floor(Math.random() * 6) + 1
    const total = roll1 + roll2 + roll3

    // Calculate modifier based on Mörk Borg rules
    let modifier = 0
    if (total <= 4) modifier = -3
    else if (total <= 6) modifier = -2
    else if (total <= 8) modifier = -1
    else if (total <= 12) modifier = 0
    else if (total <= 14) modifier = 1
    else if (total <= 16) modifier = 2
    else modifier = 3

    dispatch({
      type: 'SET_SHEET',
      sheet: { ...sheet, [stat]: modifier }
    })
  }

  const stats = [
    { key: 'str' as const, label: 'STRENGTH', abbr: 'STR' },
    { key: 'agi' as const, label: 'AGILITY', abbr: 'AGI' },
    { key: 'pre' as const, label: 'PRESENCE', abbr: 'PRE' },
    { key: 'tou' as const, label: 'TOUGHNESS', abbr: 'TOU' },
  ]

  return (
    <div className={styles.generator}>
      <div className={styles.header}>
        <button onClick={handleCancel} className={styles.backButton}>
          ← ROSTER
        </button>
        <button onClick={handleCancel} className={styles.rosterLink}>
          CANCEL
        </button>
      </div>

      <h1 className={styles.title}>FORGING NEW SCUM</h1>

      {/* Character Name */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>WHAT IS YOUR NAME?</div>
        <input
          type="text"
          className={styles.nameInput}
          value={sheet.name || ''}
          onChange={handleNameChange}
          placeholder="GURN"
        />
      </div>

      {/* Class Selection */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>CLASS SELECTION</div>
        <select
          value={sheet.class || ''}
          onChange={handleClassChange}
          className={styles.classSelect}
        >
          <option value="">GUTTER BORN SCUM</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>VITALITY</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>HP</div>
            <div className={styles.statValue}>{sheet.hp.toString().padStart(2, '0')}</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>/{sheet.maxHp}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>OMENS</div>
            <div className={styles.statValue}>{sheet.omens.toString().padStart(2, '0')}</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>ABILITIES</div>
        <div className={styles.statsGrid}>
          {stats.map(stat => (
            <div key={stat.key} className={styles.statBox}>
              <button
                className={styles.statRollButton}
                onClick={() => handleRollStat(stat.key)}
                title={`Roll ${stat.label}`}
              >
                ⚄
              </button>
              <div className={styles.statLabel}>{stat.abbr}</div>
              <div className={styles.statValue}>
                {sheet[stat.key] >= 0 ? `+${sheet[stat.key]}` : sheet[stat.key]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starting Equipment */}
      <div className={styles.section}>
        <div className={styles.banner}>STARTING SCUM</div>
        <ul className={styles.itemList}>
          {inventory.map((item: InventoryItem) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.itemName}>
                {item.name}
                {item.qty > 1 ? ` x${item.qty}` : ''}
              </span>
              <button className={styles.itemButton}>⚄</button>
            </li>
          ))}
          {scrolls.map((scroll: Scroll) => (
            <li key={scroll.id} className={styles.item}>
              <span className={styles.itemName}>{scroll.name}</span>
              <button className={styles.itemButton}>⚄</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Finalize Button */}
      <button onClick={handleConfirm} className={styles.finalizeButton}>
        FINALIZE WRETCH
      </button>
    </div>
  )
}
