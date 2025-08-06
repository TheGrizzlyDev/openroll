import React from 'react'
import { Button } from '../ui'

export default function Overlay({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) {
  return (
    <div className={`overlay${visible ? ' show' : ''}`}>
      <span>{message}</span>
      <Button onClick={onClose}>×</Button>
    </div>
  )
}
