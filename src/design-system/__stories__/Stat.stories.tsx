/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Stat } from '../Stat'

const meta: Meta<typeof Stat> = {
  title: 'Design System/Stat',
  component: Stat,
  args: {
    label: 'STR',
    value: 10,
    onChange: () => {},
    onRoll: () => {},
    onEdit: () => {}
  }
}

export default meta

type Story = StoryObj<typeof Stat>

export const Default: Story = {}
