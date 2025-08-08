/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '../FormField'
import { Input } from '../Input'

const meta: Meta<typeof FormField> = {
  title: 'Design System/FormField',
  component: FormField,
  args: {
    label: 'Label',
    htmlFor: 'example',
    children: <Input id="example" placeholder="Enter text" />
  }
}

export default meta

type Story = StoryObj<typeof FormField>

export const Default: Story = {}
