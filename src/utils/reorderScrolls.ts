import { arrayMove } from '@dnd-kit/sortable'
import type { Scroll } from '../stores/GameContext'

export function reorderScrolls(
  scrolls: Scroll[],
  activeId: number,
  overId: number
) {
  const oldIndex = scrolls.findIndex(s => s.id === activeId)
  const newIndex = scrolls.findIndex(s => s.id === overId)
  return arrayMove(scrolls, oldIndex, newIndex)
}

export default reorderScrolls
