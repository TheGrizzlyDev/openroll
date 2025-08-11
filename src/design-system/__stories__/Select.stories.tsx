/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from '..'

const meta: Meta<typeof Select> = {
  title: 'Design System/Select',
  component: Select
}

export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    children: (
      <>
        <option value="">Choose</option>
        <option value="one">One</option>
        <option value="two">Two</option>
      </>
    ),
  },
}
