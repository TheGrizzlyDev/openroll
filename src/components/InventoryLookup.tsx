import React, { useEffect, useRef, useState } from 'react'
import { useGameContext } from '../GameContext'
import { Button } from '../ui'

interface InventoryLookupProps {
  description?: string
  attrs: Record<string, string>
}

export default function InventoryLookup({ description, attrs }: InventoryLookupProps) {
  const { state } = useGameContext()
  const [open, setOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    const onMouseDown = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open])

  return (
    <>
      <Button type="button" className="badge" onClick={() => setOpen(true)}>
        {description || 'Inventory'}
      </Button>
      {open && (
        <div ref={overlayRef} className="overlay show">
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <button type="button" onClick={() => setOpen(false)}>{item.name}</button>
              </li>
            ))}
          </ul>
          <Button type="button" onClick={() => setOpen(false)}>
            ×
          </Button>
        </div>
      )}
    </>
  )
}
