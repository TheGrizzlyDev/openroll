/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { ark } from '@ark-ui/react'

const Textarea = ark.textarea

const meta: Meta<typeof Textarea> = {
  title: 'Ark UI/Textarea',
  component: Textarea,
  args: { placeholder: 'Enter text' },
}

export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {}
