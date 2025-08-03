import React from 'react'

export default function Overlay({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) {
  return (
    <div className={`overlay${visible ? ' show' : ''}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  )
}
