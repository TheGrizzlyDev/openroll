/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import InventoryItem from './InventoryItem'
import { Button } from '../design-system'

const meta: Meta<typeof InventoryItem> = {
  title: 'Components/InventoryItem',
  component: InventoryItem
}

export default meta

type Story = StoryObj<typeof InventoryItem>

export const Default: Story = {
  render: () => (
    <DndContext>
      <SortableContext items={[1]}>
        <ul>
          <InventoryItem item={{ id: 1, name: 'Sword', qty: 1, notes: 'Sharp blade' }} />
        </ul>
      </SortableContext>
    </DndContext>
  )
}

export const Expanded: Story = {
  render: () => (
    <DndContext>
      <SortableContext items={[1]}>
        <ul>
          <InventoryItem
            item={{ id: 1, name: 'Shield', qty: 1, notes: 'Sturdy' }}
            defaultExpanded
          />
        </ul>
      </SortableContext>
    </DndContext>
  )
}

export const CustomAction: Story = {
  render: () => (
    <DndContext>
      <SortableContext items={[1]}>
        <ul>
          <InventoryItem
            item={{ id: 1, name: 'Potion', qty: 1, notes: 'Heal 1d4' }}
            defaultExpanded
          >
            <Button>Use</Button>
          </InventoryItem>
        </ul>
      </SortableContext>
    </DndContext>
  )
}

