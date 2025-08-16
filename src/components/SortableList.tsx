import { type ReactNode, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  type UniqueIdentifier
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { reorderItems } from '../utils/reorderItems'

interface SortableListProps<T extends { id: UniqueIdentifier }> {
  items: T[]
  onReorder: (_items: T[]) => void
  renderItem: (_item: T) => ReactNode
  className?: string
}

export default function SortableList<T extends { id: UniqueIdentifier }>(
  { items, onReorder, renderItem, className }: SortableListProps<T>
) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))
  const [startPointerY, setStartPointerY] = useState(0)

  const handleDragStart = (event: DragStartEvent) => {
    const activator = event.activatorEvent as PointerEvent | TouchEvent | KeyboardEvent
    let y = 0
    if ('touches' in activator) {
      y = activator.touches[0]?.clientY ?? 0
    } else if ('clientY' in activator) {
      y = activator.clientY ?? 0
    }
    setStartPointerY(y)
    document.body.style.overflow = 'hidden'
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const currentY = startPointerY + event.delta.y
    const threshold = 40
    const viewportHeight = window.innerHeight
    if (currentY < threshold) {
      window.scrollBy({ top: -10 })
    } else if (currentY > viewportHeight - threshold) {
      window.scrollBy({ top: 10 })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    document.body.style.overflow = ''
    if (over && active.id !== over.id) {
      onReorder(reorderItems(items, active.id, over.id))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)}>
        <ul className={`m-0 mb-2 list-none p-0 ${className ?? ''}`}>
          {items.map(item => renderItem(item))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

