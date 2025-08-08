import { describe, it, expect } from 'vitest'
import { reorderItems } from '../src/components/SortableList'

describe('SortableList reorderItems', () => {
  interface Item { id: number; name: string }
  it('reorders items based on ids', () => {
    const items: Item[] = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' }
    ]
    const result = reorderItems(items, 1, 3)
    expect(result).toEqual([items[1], items[2], items[0]])
  })
})
