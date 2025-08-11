/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog, ark } from '@ark-ui/react'
import { useState } from 'react'

const meta: Meta<typeof Dialog.Root> = {
  title: 'Ark UI/Dialog',
  component: Dialog.Root,
}

export default meta

type Story = StoryObj<typeof Dialog.Root>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <ark.button type="button" onClick={() => setOpen(true)}>
          Open Dialog
        </ark.button>
        <Dialog.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <ark.input placeholder="Focus me" />
              <Dialog.CloseTrigger asChild>
                <ark.button type="button">Close</ark.button>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </>
    )
  },
}
