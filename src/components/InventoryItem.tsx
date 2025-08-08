import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { useGameContext, type InventoryItem as Item, type Scroll } from '../GameContext'
import { renderOml } from '../oml/render'

interface Props {
  item: Item | Scroll
  children?: ReactNode
}

export default function InventoryItem({ item, children }: Props) {
  const { roll } = useGameContext()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  }

  const details = 'casts' in item
    ? (
        <>
          {item.name} [{item.type}] ({item.casts})
          {item.notes ? <> - {renderOml(item.notes, roll)}</> : ''}
        </>
      )
    : (
        <>
          {item.name} ({item.qty})
          {item.notes ? <> - {renderOml(item.notes, roll)}</> : ''}
        </>
      )

  return (
    <li ref={setNodeRef} style={style} className={isDragging ? 'dragging' : ''}>
      <span className="drag-handle" {...attributes} {...listeners}>::</span>
      <div>
        <span>{details}</span>
        {children}
      </div>
    </li>
  )
}

