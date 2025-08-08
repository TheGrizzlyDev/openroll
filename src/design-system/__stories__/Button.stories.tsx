/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button'

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  args: { children: 'Button' },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {}
