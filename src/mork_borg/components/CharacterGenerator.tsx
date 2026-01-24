import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { useGameContext } from '../../stores/GameContext'
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

  const handleRerollAll = () => {
    createCharacter()
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_SHEET',
      sheet: { ...sheet, name: e.target.value }
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
        <button onClick={handleRerollAll} className={styles.rerollButton}>
          REROLL ALL <span className={styles.rerollIcon}>⚡</span>
        </button>
      </div>

      <div className={styles.titleBar}>
        <h1 className={styles.title}>FORGING NEW SCUM</h1>
      </div>

      {/* Character Name */}
      <div className={styles.section}>
        <div className={styles.sectionTag}>IDENTITY</div>
        <input
          type="text"
          className={styles.nameInput}
          value={sheet.name || ''}
          onChange={handleNameChange}
          placeholder="Character Name"
        />
      </div>

      {/* Class Selection */}
      <div className={styles.section}>
        <div className={styles.sectionTag}>CLASS</div>
        <div className={styles.classValue}>{(sheet.class || 'Gutter Born Scum').toUpperCase()}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.statsGrid}>
          <div className={`${styles.statTile} ${styles.statTileAccent}`}>
            <div className={styles.statLabel}>VITALITY</div>
            <div className={styles.vitalityValue}>
              <span className={styles.statValue}>{sheet.hp}</span>
              <span className={styles.statDivider}>/</span>
              <span className={styles.statValueSmall}>{sheet.maxHp}</span>
            </div>
          </div>
          <div className={`${styles.statTile} ${styles.statTileAccent}`}>
            <div className={styles.statLabel}>ARMOR</div>
            <div className={styles.armorValue}>
              <span className={styles.statValueMedium}>TIER {sheet.armor}</span>
              <span className={styles.armorIcon}>🛡</span>
            </div>
          </div>
          {stats.map(stat => (
            <div key={stat.key} className={styles.statTile}>
              <div className={styles.statLabel}>{stat.abbr}</div>
              <div className={styles.statValueMedium}>
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
              <div className={styles.itemText}>
                <span className={styles.itemName}>
                  {item.name}
                  {item.qty > 1 ? ` x${item.qty}` : ''}
                </span>
                {item.notes ? <span className={styles.itemNotes}>{item.notes}</span> : null}
              </div>
            </li>
          ))}
          {scrolls.map((scroll: Scroll) => (
            <li key={scroll.id} className={styles.item}>
              <div className={styles.itemText}>
                <span className={styles.itemName}>{scroll.name}</span>
                {scroll.notes ? <span className={styles.itemNotes}>{scroll.notes}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Finalize Button */}
      <button onClick={handleConfirm} className={styles.finalizeButton}>
        FINALIZE
      </button>
    </div>
  )
}
