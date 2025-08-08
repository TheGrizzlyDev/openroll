/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Canvas } from '@react-three/fiber'
import DiceTray from '../DiceTray'
import Dice3D from '../Dice3D'

const meta: Meta<typeof DiceTray> = {
  title: 'Components/DiceTray',
  component: DiceTray,
  parameters: { layout: 'fullscreen' },
  args: { size: 5 },
}

export default meta

type Story = StoryObj<typeof DiceTray>

const TrayExample = (args: Story['args']) => (
  <div className="h-64 w-full">
    <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} />
      <DiceTray {...args}>
        <Dice3D type="d6" rollResult={3} position={[0, 1, 0]} />
      </DiceTray>
    </Canvas>
  </div>
)

export const Default: Story = {
  render: TrayExample,
}

export const Mobile: Story = {
  render: args => (
    <div className="h-64 w-[375px]">
      <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} />
        <DiceTray {...args} />
      </Canvas>
    </div>
  ),
}
