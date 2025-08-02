import React from 'react'

export default function Overlay({ message, visible, onClose }) {
  return (
    <div className={`overlay${visible ? ' show' : ''}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  )
}
