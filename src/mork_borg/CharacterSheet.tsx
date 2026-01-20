import { useGameContext } from '../stores/GameContext'
import StatGrid from './StatGrid'
import type { Sheet } from './sheet'

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

  // Styles specific for this sheet
  const boxStyle = {
    background: 'var(--color-accent)', // Yellow background
    color: 'black',
    padding: '1.5rem',
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px solid var(--color-accent)',
    position: 'relative'
  } as const

  const labelStyle = {
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem'
  } as const

  const valueStyle = {
    fontSize: '5rem',
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: '-0.05em'
  } as const

  return (
    <div className="sheet" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '4rem', fontFamily: 'var(--font-heading)' }}>

      {/* Header */}
      <header style={{ marginBottom: '3rem', marginTop: '1rem' }}>
        <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', color: 'white', marginBottom: '0.25rem' }}>
          {sheet.name || 'Nameless Scum'}
        </div>
        <div style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
          {sheet.class || 'Classless'}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <h1 style={{
            fontStyle: 'italic',
            fontSize: '4rem',
            lineHeight: 0.9,
            color: 'var(--color-accent)',
            margin: 0,
            transform: 'skew(-5deg)'
          }}>
            DYING<br />WORLD
          </h1>
          <p style={{
            color: 'var(--color-text-dim)',
            fontStyle: 'italic',
            fontSize: '0.875rem',
            marginTop: '1rem'
          }}>
            "The world dies. You die. Everyone dies."
          </p>
        </div>
      </header>

      {/* HP & Omens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

        {/* HIT POINTS */}
        <div style={boxStyle}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>♥</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={labelStyle}>Hit Points</div>
            <div style={valueStyle}>
              {sheet.hp.toString().padStart(2, '0')}<span style={{ fontSize: '2rem', opacity: 0.6 }}>/{sheet.maxHp}</span>
            </div>
          </div>
          {/* Simple controls */}
          <div style={{ position: 'absolute', bottom: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => updateField('hp', Math.max(0, sheet.hp - 1))}
              style={{ background: 'black', color: 'var(--color-accent)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}>-</button>
            <button
              onClick={() => updateField('hp', Math.min(sheet.maxHp, sheet.hp + 1))}
              style={{ background: 'black', color: 'var(--color-accent)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}>+</button>
          </div>
        </div>

        {/* OMENS */}
        <div style={{ ...boxStyle, background: 'black', color: 'var(--color-accent)' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>🪄</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={labelStyle}>Omens</div>
            <div style={valueStyle}>
              {sheet.omens.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => updateField('omens', Math.max(0, sheet.omens - 1))}
              style={{ background: 'var(--color-accent)', color: 'black', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}>-</button>
            <button
              onClick={() => updateField('omens', sheet.omens + 1)}
              style={{ background: 'var(--color-accent)', color: 'black', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}>+</button>
          </div>
        </div>

      </div>

      <StatGrid sheet={sheet} updateField={updateField} rollStat={rollStat} />

      {/* Equipment Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid var(--color-accent)',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontStyle: 'italic',
          margin: 0,
          color: 'white',
          transform: 'skew(-10deg)'
        }}>EQUIPMENT</h2>
        <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
          7/12 SLOTS
        </span>
      </div>

      {/* Placeholder Equipment Item to match mockup */}
      <div style={{
        background: '#111',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'black'
        }}>
          ⚔️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>ZWEIHANDER</div>
          <div style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>HEAVY / TWO-HANDED</div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, fontStyle: 'italic', color: 'white' }}>
          d10+2
        </div>
      </div>

      <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
        A rusted, notched blade of immense weight.
      </div>

      <button style={{
        background: 'transparent',
        border: '1px solid var(--color-accent)',
        color: 'var(--color-accent)',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        cursor: 'pointer'
      }}
        onClick={() => roll('1d10+2', 'Zweihander')}
      >
        🎲 Roll 1d10+2
      </button>

      {/* Existing form fields mostly hidden or pushed to bottom/settings? 
          For now I'll just keep the main visual elements. 
      */}

    </div>
  )
}
