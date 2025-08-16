import type { UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

export function reorderItems<T extends { id: UniqueIdentifier }>(
  items: T[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
) {
  const oldIndex = items.findIndex(i => i.id === activeId)
  const newIndex = items.findIndex(i => i.id === overId)
  return arrayMove(items, oldIndex, newIndex)
}

export default reorderItems
