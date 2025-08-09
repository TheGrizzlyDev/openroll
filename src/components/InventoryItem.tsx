import { type ReactNode, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import {
  useGameContext,
  type InventoryItem as Item,
  type Scroll
} from '../GameContext'
import { renderOml } from '../oml/render'
import { Button } from '../design-system'

interface Props {
  item: Item | Scroll
  children?: ReactNode
  defaultExpanded?: boolean
}

export default function InventoryItem({ item, children, defaultExpanded }: Props) {
  const {
    state: { inventory },
    dispatch,
    roll
  } = useGameContext()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  }

  const inc = () => {
    if ('qty' in item) {
      const updated = inventory.map(i =>
        i.id === item.id ? { ...i, qty: i.qty + 1 } : i
      )
      dispatch({ type: 'SET_INVENTORY', inventory: updated })
    }
  }

  const dec = () => {
    if ('qty' in item) {
      const updated = inventory
        .map(i => (i.id === item.id ? { ...i, qty: i.qty - 1 } : i))
        .filter(i => i.qty > 0)
      dispatch({ type: 'SET_INVENTORY', inventory: updated })
    }
  }

  const hasQty = 'qty' in item

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 rounded bg-white/5 p-2 text-sm transition-opacity ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span
        className="cursor-grab flex-none touch-none text-lg"
        {...attributes}
        {...listeners}
      >
        ☰
      </span>
      <div className="flex flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          className="flex-grow text-left font-semibold"
        >
          {'casts' in item
            ? `${item.name} [${item.type}] (${item.casts})`
            : item.name}
        </button>
        {hasQty && (
          <span className="flex items-center gap-1">
            <Button
              type="button"
              aria-label="Decrease quantity"
              onClick={dec}
              className="h-auto w-auto border-none bg-white/10 px-2 py-0.5 text-xs font-normal tracking-normal text-white hover:bg-white/20 hover:text-white normal-case"
            >
              -
            </Button>
            <span className="w-5 text-center">{item.qty}</span>
            <Button
              type="button"
              aria-label="Increase quantity"
              onClick={inc}
              className="h-auto w-auto border-none bg-white/10 px-2 py-0.5 text-xs font-normal tracking-normal text-white hover:bg-white/20 hover:text-white normal-case"
            >
              +
            </Button>
          </span>
        )}
      </div>
      {expanded && (item.notes || children) && (
        <div className="mt-2 rounded bg-white/10 p-2 text-white/80">
          {item.notes && <div>{renderOml(item.notes, roll)}</div>}
          {children}
        </div>
      )}
    </li>
  )
}

