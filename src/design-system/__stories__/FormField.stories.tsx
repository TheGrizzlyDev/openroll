/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Field } from '@ark-ui/react'

const meta: Meta<typeof Field.Root> = {
  title: 'Ark UI/Field',
  component: Field.Root,
}

export default meta

type Story = StoryObj<typeof Field.Root>

export const Default: Story = {
  render: () => (
    <Field.Root>
      <Field.Label htmlFor="example">Label</Field.Label>
      <Field.Input id="example" placeholder="Enter text" />
    </Field.Root>
  ),
}

