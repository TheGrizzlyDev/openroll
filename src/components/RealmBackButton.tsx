import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'

const buttonStyle: CSSProperties = {
  alignItems: 'center',
  background: 'none',
  border: 0,
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: '1rem',
  padding: 0,
}

export default function RealmBackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      aria-label="Back to roster"
      title="Back to roster"
      onClick={() => navigate('/roster')}
      style={buttonStyle}
    >
      ←
    </button>
  )
}
