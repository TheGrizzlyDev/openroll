/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { ark } from '@ark-ui/react'

const Input = ark.input

const meta: Meta<typeof Input> = {
  title: 'Ark UI/Input',
  component: Input,
  args: { placeholder: 'Enter text' },
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {}
