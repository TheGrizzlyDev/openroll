import React, { useState } from 'react'
import { useGameContext } from '../GameContext'
import { Button, Dialog } from '../design-system'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table'

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

  const columns: ColumnDef<{ id: string | number; name: string }>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => (
        <Button type="button" onClick={() => setOpen(false)}>
          {info.getValue<string>()}
        </Button>
      )
    }
  ]
  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {description || 'Inventory'}
      </Button>
      {open && (
        <Dialog.Root open={open} onOpenChange={open => !open && setOpen(false)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <table>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
