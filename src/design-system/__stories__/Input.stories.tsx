/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '..'

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  args: { placeholder: 'Enter text' }
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {}
