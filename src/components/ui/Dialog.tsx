import { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

export const DialogRoot = RadixDialog.Root
export const DialogCloseTrigger = RadixDialog.Close
export const DialogTitle = RadixDialog.Title
export const DialogDescription = RadixDialog.Description

export const DialogBackdrop = (props: RadixDialog.DialogOverlayProps) => (
  <RadixDialog.Overlay className="fixed inset-0 bg-black/50" {...props} />
)

export const DialogPositioner = ({ children }: { children: ReactNode }) => (
  <RadixDialog.Portal>{children}</RadixDialog.Portal>
)

export const DialogContent = (props: RadixDialog.DialogContentProps) => {
  return (
    <RadixDialog.Content
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2000,
      }}
      className="bg-bg p-4 shadow-lg"
      {...props}
    />
  )
}
