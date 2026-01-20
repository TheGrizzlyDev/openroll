import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { useGameContext } from '../../stores/GameContext'
import classes from '../classes'
import type { InventoryItem, Scroll } from '../generateCharacter'

export default function CharacterGenerator() {
  const {
    state: { sheet, inventory, scrolls },
    createCharacter,
    finalizeCharacter,
    cancelCreation
  } = useGameContext()
  const navigate = useNavigate()

  const handleConfirm = () => {
    const index = finalizeCharacter()
    navigate(`/sheet/${index}`)
  }

  const handleCancel = () => {
    cancelCreation()
    navigate('/')
  }

  const handleClassChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    createCharacter(value || undefined)
  }

  const handleRollClass = () => {
    createCharacter()
  }

  // Styles
  const pageStyle = {
    fontFamily: 'var(--font-heading)',
    color: 'white',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem'
  }

  const sectionTitleStyle = {
    fontSize: '2rem',
    color: 'var(--color-accent)',
    borderBottom: '2px solid var(--color-accent)',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em'
  }

  const buttonStyle = {
    background: 'var(--color-accent)',
    color: 'black',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)'
  }

  return (
    <div style={pageStyle}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{
          fontSize: '4rem',
          color: 'var(--color-accent)',
          margin: 0,
          transform: 'rotate(-2deg)'
        }}>
          BIRTH A WRETCH
        </h1>
        <p style={{ fontStyle: 'italic', opacity: 0.7 }}>Who will die in the dark?</p>
      </header>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={sectionTitleStyle}>1. CHOOSE YOUR DOOM</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={sheet.class || ''}
            onChange={handleClassChange}
            style={{
              background: 'black',
              color: 'var(--color-accent)',
              border: '2px solid var(--color-accent)',
              padding: '0.5rem',
              fontSize: '1.25rem',
              fontFamily: 'inherit',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <option value="">(Random Scum)</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>OR</span>
          <button onClick={handleRollClass} style={{ ...buttonStyle, background: 'white' }}>
            ROLL THE DICE
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '2rem' }}>

        {/* Left Column: Stats & Abilities */}
        <div>
          <h2 style={sectionTitleStyle}>2. THE FLESH</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { label: 'STR', val: sheet.str },
              { label: 'AGI', val: sheet.agi },
              { label: 'PRE', val: sheet.pre },
              { label: 'TOU', val: sheet.tou }
            ].map(stat => (
              <div key={stat.label} style={{
                border: '2px solid white',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {stat.val > 0 ? `+${stat.val}` : stat.val}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>VITALITY</h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>HP: <span style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}>{sheet.hp}</span></div>
              <div>OMENS: <span style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}>{sheet.omens}</span></div>
              <div>SILVER: <span style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}>{sheet.silver}</span></div>
            </div>
          </div>

          {sheet.notes && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>ABILITIES ({sheet.class || 'Classless'})</h3>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                {sheet.notes.split('\n').filter(Boolean).map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Inventory */}
        <div style={{ background: '#111', padding: '1rem', border: '1px solid #333' }}>
          <h2 style={{ ...sectionTitleStyle, fontSize: '1.5rem', borderBottom: 'none' }}>BELONGINGS</h2>
          <div style={{ marginBottom: '1rem' }}>
            <strong>WEAPONS & GEAR</strong>
            <ul style={{ paddingLeft: '1.2rem', color: '#ccc' }}>
              {inventory.map((item: InventoryItem) => (
                <li key={item.id}>
                  {item.name}
                  {item.qty > 1 ? ` x${item.qty}` : ''}
                  {item.notes ? ` (${item.notes})` : ''}
                </li>
              ))}
            </ul>
          </div>

          {scrolls.length > 0 && (
            <div>
              <strong>SCROLLS - UNCLEAN</strong>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-accent)' }}>
                {scrolls.map((scroll: Scroll) => (
                  <li key={scroll.id}>
                    {scroll.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      <div style={{
        marginTop: '4rem',
        paddingTop: '2rem',
        borderTop: '2px dashed #333',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem'
      }}>
        <button
          onClick={handleCancel}
          style={{
            ...buttonStyle,
            background: 'transparent',
            color: 'var(--color-text-dim)',
            border: '1px solid #333'
          }}
        >
          DISCARD
        </button>
        <button
          onClick={handleConfirm}
          style={{ ...buttonStyle, fontSize: '1.5rem', padding: '1rem 2rem' }}
        >
          ACCEPT THIS FATE
        </button>
      </div>

    </div>
  )
}
