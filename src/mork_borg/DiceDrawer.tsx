import React, { useState } from 'react'
import { useGameContext } from '../stores/GameContext'
import styles from './DiceDrawer.module.css'

export default function DiceDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { roll } = useGameContext()
    const [customNotation, setCustomNotation] = useState('')

    const dice = [
        { type: 'd4', label: 'D4', notation: '1d4' },
        { type: 'd6', label: 'D6', notation: '1d6' },
        { type: 'd8', label: 'D8', notation: '1d8' },
        { type: 'd10', label: 'D10', notation: '1d10' },
        { type: 'd12', label: 'D12', notation: '1d12' },
        { type: 'd20', label: 'D20', notation: '1d20' },
        { type: 'd100', label: 'D100', notation: '1d100' },
    ]

    const handleRoll = (notation: string) => {
        if (!notation) return
        roll(notation)
        onClose()
    }

    return (
        <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
            <div className={styles.content}>
                <div className={styles.diceGrid}>
                    {dice.map((die) => (
                        <button
                            key={die.type}
                            className={`${styles.diceButton} ${customNotation.toLowerCase() === die.notation ? styles.selected : ''}`}
                            onClick={() => setCustomNotation(die.notation)}
                        >
                            <div className={styles.diceIcon}>{die.label}</div>
                        </button>
                    ))}
                    <button
                        className={`${styles.diceButton} ${styles.rollActionButton}`}
                        onClick={() => handleRoll(customNotation)}
                    >
                        <div className={styles.diceIcon}>ROLL</div>
                    </button>
                </div>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        className={styles.rollInput}
                        placeholder="ROLL COMMAND (e.g. 2d8+HP)"
                        value={customNotation}
                        onChange={(e) => setCustomNotation(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customNotation) {
                                handleRoll(customNotation)
                            }
                        }}
                    />
                </div>
            </div>
            <div className={styles.backdrop} onClick={onClose} />
        </div>
    )
}
