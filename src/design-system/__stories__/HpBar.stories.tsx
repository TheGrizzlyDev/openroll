/* eslint-disable storybook/no-renderer-packages */
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { HpBar } from '../HpBar'

const meta: Meta<typeof HpBar> = {
  title: 'Design System/HpBar',
  component: HpBar
}

export default meta

type Story = StoryObj<typeof HpBar>

export const Default: Story = {
  render: () => {
    const [hp, setHp] = useState(8)
    const [tempHp, setTempHp] = useState(2)
    const [maxHp, setMaxHp] = useState(10)
    return (
      <HpBar
        hp={hp}
        tempHp={tempHp}
        maxHp={maxHp}
        onHpChange={setHp}
        onTempHpChange={setTempHp}
        onMaxHpChange={setMaxHp}
      />
    )
  }
}
