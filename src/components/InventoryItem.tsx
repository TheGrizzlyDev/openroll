import { type ReactNode, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import {
  useGameContext,
  type InventoryItem as Item,
  type Scroll
} from '../GameContext'
import { renderOml } from '../oml/render'

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
    <li ref={setNodeRef} style={style} className={isDragging ? 'dragging' : ''}>
      <span className="drag-handle" {...attributes} {...listeners}>::</span>
      <div>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          {'casts' in item
            ? `${item.name} [${item.type}] (${item.casts})`
            : item.name}
        </button>
        {hasQty && (
          <span className="quantity-controls">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={dec}
            >
              -
            </button>
            <span>{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={inc}
            >
              +
            </button>
          </span>
        )}
      </div>
      {expanded && (item.notes || children) && (
        <div className="item-details">
          {item.notes && <div>{renderOml(item.notes, roll)}</div>}
          {children}
        </div>
      )}
    </li>
  )
}

