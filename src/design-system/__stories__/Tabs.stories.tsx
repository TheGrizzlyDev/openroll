/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabList, Tab, TabPanel } from '../Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Design System/Tabs',
  component: Tabs,
}

export default meta

type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabList>
        <Tab value="one">One</Tab>
        <Tab value="two">Two</Tab>
        <Tab value="three">Three</Tab>
      </TabList>
      <TabPanel value="one">First tab content</TabPanel>
      <TabPanel value="two">Second tab content</TabPanel>
      <TabPanel value="three">Third tab content</TabPanel>
    </Tabs>
  ),
}
