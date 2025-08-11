import React, { useState } from 'react'
import { useGameContext } from '../GameContext'
import { Button } from '../design-system'
import { Dialog } from '@ark-ui/react'

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
      <Button type="button" onClick={() => setOpen(true)}>
        {description || 'Inventory'}
      </Button>
        {open && (
          <Dialog.Root open={open} onOpenChange={({ open }) => !open && setOpen(false)}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <ul>
                  {items.map(item => (
                    <li key={item.id}>
                      <Button type="button" onClick={() => setOpen(false)}>{item.name}</Button>
                    </li>
                  ))}
                </ul>
                <Dialog.CloseTrigger asChild>
                  <Button type="button">×</Button>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
      </>
    )
  }
