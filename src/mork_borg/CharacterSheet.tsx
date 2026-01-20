import { useGameContext } from '../stores/GameContext'
import StatGrid from './StatGrid'
import type { Sheet } from './sheet'
import styles from './CharacterSheet.module.css'

type StatKey = 'str' | 'agi' | 'pre' | 'tou'

export default function CharacterSheet() {
  const {
    state: { sheet },
    dispatch,
    roll
  } = useGameContext()
  const updateField = <K extends keyof Sheet>(field: K, value: Sheet[K]) =>
    dispatch({ type: 'SET_SHEET', sheet: { ...sheet, [field]: value } })

  const rollStat = (stat: StatKey, advantage = false) => {
    const mod = Number(sheet[stat]) || 0
    const notation = advantage ? '2d20kh1' : '1d20'
    const fullNotation = mod ? `${notation}${mod >= 0 ? `+${mod}` : mod}` : notation
    roll(fullNotation, stat.toUpperCase())
  }

  return (
    <div className={styles.sheet}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.name}>
          {sheet.name || 'Nameless Scum'}
        </div>
        <div className={styles.class}>
          {sheet.class || 'Classless'}
        </div>

        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            DYING<br />WORLD
          </h1>
          <p className={styles.subtitle}>
            "The world dies. You die. Everyone dies."
          </p>
        </div>
      </header>

      {/* HP & Omens */}
      <div className={styles.grid}>

        {/* HIT POINTS */}
        <div className={styles.box}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>♥</span>
          </div>
          <div className={styles.contentCenter}>
            <div className={styles.label}>Hit Points</div>
            <div className={styles.value}>
              {sheet.hp.toString().padStart(2, '0')}<span className={styles.valueMax}>/{sheet.maxHp}</span>
            </div>
          </div>
          {/* Simple controls */}
          <div className={styles.controls}>
            <button
              onClick={() => updateField('hp', Math.max(0, sheet.hp - 1))}
              className={styles.controlButton}>-</button>
            <button
              onClick={() => updateField('hp', Math.min(sheet.maxHp, sheet.hp + 1))}
              className={styles.controlButton}>+</button>
          </div>
        </div>

        {/* OMENS */}
        <div className={`${styles.box} ${styles.boxBlack}`}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>🪄</span>
          </div>
          <div className={styles.contentCenter}>
            <div className={styles.label}>Omens</div>
            <div className={styles.value}>
              {sheet.omens.toString().padStart(2, '0')}
            </div>
          </div>
          <div className={styles.controls}>
            <button
              onClick={() => updateField('omens', Math.max(0, sheet.omens - 1))}
              className={styles.controlButton}>-</button>
            <button
              onClick={() => updateField('omens', sheet.omens + 1)}
              className={styles.controlButton}>+</button>
          </div>
        </div>

      </div>

      <StatGrid sheet={sheet} updateField={updateField} rollStat={rollStat} />

      {/* Equipment Header */}
      {/* Equipment is now handled by the Inventory component in SheetPage */}

      {/* Existing form fields mostly hidden or pushed to bottom/settings? 
          For now I'll just keep the main visual elements. 
      */}

    </div>
  )
}
