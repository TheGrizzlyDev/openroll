/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from '..'

const meta: Meta<typeof Tabs.Root> = {
  title: 'Design System/Tabs',
  component: Tabs.Root,
}

export default meta

type Story = StoryObj<typeof Tabs.Root>

export const Default: Story = {
  render: () => (
    <Tabs.Root defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one">One</Tabs.Trigger>
        <Tabs.Trigger value="two">Two</Tabs.Trigger>
        <Tabs.Trigger value="three">Three</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="one">First tab content</Tabs.Content>
      <Tabs.Content value="two">Second tab content</Tabs.Content>
      <Tabs.Content value="three">Third tab content</Tabs.Content>
    </Tabs.Root>
  ),
}
