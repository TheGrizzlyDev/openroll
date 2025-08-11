/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { ark } from '@ark-ui/react'

const Button = ark.button

const meta: Meta<typeof Button> = {
  title: 'Ark UI/Button',
  component: Button,
  args: { children: 'Button' },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {}
