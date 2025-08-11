/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from '@ark-ui/react'
import { Button } from '..'
import { Input } from '..'
import { useState } from 'react'

const meta: Meta<typeof Dialog.Root> = {
  title: 'Design System/Dialog',
  component: Dialog.Root,
}

export default meta

type Story = StoryObj<typeof Dialog.Root>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
          <Button type="button" onClick={() => setOpen(true)}>
            Open Dialog
          </Button>
          <Dialog.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Input placeholder="Focus me" />
                <Dialog.CloseTrigger asChild>
                  <Button type="button">Close</Button>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </>
      )
    },
  }
