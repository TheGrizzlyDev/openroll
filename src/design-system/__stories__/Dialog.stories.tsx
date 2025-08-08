/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from '../Dialog'
import { Button } from '../Button'
import { Input } from '../Input'
import { useState } from 'react'

const meta: Meta<typeof Dialog> = {
  title: 'Design System/Dialog',
  component: Dialog,
}

export default meta

type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog visible={open} onClose={() => setOpen(false)}>
          <Input placeholder="Focus me" />
        </Dialog>
      </>
    )
  },
}
