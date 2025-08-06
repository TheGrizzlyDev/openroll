import React, { useState } from 'react'
import { useGameContext } from '../GameContext'
import { Button } from '../ui'
import Popup from './Popup'

interface InventoryLookupProps {
  description?: string
  attrs: Record<string, string>
}

export default function InventoryLookup({ description, attrs }: InventoryLookupProps) {
  const { state } = useGameContext()
  const [open, setOpen] = useState(false)

  const types = attrs.type ? attrs.type.split(',').map(t => t.trim()) : []
  const ownedOnly = attrs.owned === 'true'

  let items: { id: string | number; name: string }[] = []

  if (ownedOnly) {
    if (types.length === 0 || types.includes('weapon') || types.includes('inventory')) {
      items = items.concat(state.inventory.map(i => ({ id: i.id, name: i.name })))
    }
    if (types.includes('scroll')) {
      items = items.concat(state.scrolls.map(s => ({ id: `scroll-${s.id}`, name: s.name })))
    }
  }

  return (
    <>
      <Button type="button" className="badge" onClick={() => setOpen(true)}>
        {description || 'Inventory'}
      </Button>
      <Popup visible={open} onClose={() => setOpen(false)}>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <button type="button" onClick={() => setOpen(false)}>{item.name}</button>
            </li>
          ))}
        </ul>
      </Popup>
    </>
  )
}
