/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { useGameContext } from '../../GameContext'
import LogView from '../LogView'

const WithData = () => {
  const { dispatch } = useGameContext()
  useEffect(() => {
    dispatch({
      type: 'SET_LOG',
      log: [
        { label: 'Attack', output: '1d20 = 12' },
        { label: 'Damage', output: '1d6 = 4' },
      ],
    })
  }, [dispatch])
  return <LogView />
}

const meta: Meta<typeof LogView> = {
  title: 'Components/LogView',
  component: LogView,
}

export default meta

type Story = StoryObj<typeof LogView>

export const Desktop: Story = {
  render: () => (
    <div className="max-w-md p-4">
      <WithData />
    </div>
  ),
}

export const Mobile: Story = {
  render: () => (
    <div className="w-[375px] p-2">
      <WithData />
    </div>
  ),
}
