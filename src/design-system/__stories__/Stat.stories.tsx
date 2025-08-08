/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Stat } from '../Stat'

const meta: Meta<typeof Stat> = {
  title: 'Design System/Stat',
  component: Stat,
  args: {
    id: 'str',
    value: 10,
    onChange: value => { void value },
    onRoll: () => {},
    onEdit: () => {}
  }
}

export default meta

type Story = StoryObj<typeof Stat>

export const Basic: Story = {}

export const InfoEnabled: Story = {
  args: {
    onInfo: () => {}
  }
}

export const LongPress: Story = {
  args: {
    onRollAdv: () => {}
  }
}
