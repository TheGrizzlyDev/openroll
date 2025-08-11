/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '..'

const meta: Meta<typeof Textarea> = {
  title: 'Design System/Textarea',
  component: Textarea,
  args: { placeholder: 'Enter text' }
}

export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {}
