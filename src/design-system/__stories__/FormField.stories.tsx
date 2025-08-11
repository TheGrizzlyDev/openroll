/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { FormField, Input } from '..'

const meta: Meta<typeof FormField> = {
  title: 'Design System/FormField',
  component: FormField,
}

export default meta

type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: () => (
    <FormField label="Label" htmlFor="example">
      <Input id="example" placeholder="Enter text" />
    </FormField>
  ),
}

