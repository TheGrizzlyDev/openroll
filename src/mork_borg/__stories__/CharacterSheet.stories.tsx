/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import CharacterSheet from '../CharacterSheet'

const meta: Meta<typeof CharacterSheet> = {
  title: 'Screens/CharacterSheet',
  component: CharacterSheet,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Story = StoryObj<typeof CharacterSheet>

export const Desktop: Story = {
  render: () => (
    <div className="max-w-screen-md m-auto p-4">
      <CharacterSheet />
    </div>
  ),
}

export const Mobile: Story = {
  render: () => (
    <div className="w-[375px] p-2">
      <CharacterSheet />
    </div>
  ),
}
