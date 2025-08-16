import { ReactNode, useEffect } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { useFloating } from '@floating-ui/react'

export const DialogRoot = RadixDialog.Root
export const DialogCloseTrigger = RadixDialog.Close

export const DialogBackdrop = (props: RadixDialog.DialogOverlayProps) => (
  <RadixDialog.Overlay className="fixed inset-0 bg-black/50" {...props} />
)

export const DialogPositioner = ({ children }: { children: ReactNode }) => (
  <RadixDialog.Portal>{children}</RadixDialog.Portal>
)

export const DialogContent = (props: RadixDialog.DialogContentProps) => {
  const { x, y, strategy, refs } = useFloating()

  useEffect(() => {
    refs.setReference({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        top: window.innerHeight / 2,
        bottom: window.innerHeight / 2,
        left: window.innerWidth / 2,
        right: window.innerWidth / 2,
      }),
    })
  }, [refs])

  return (
    <RadixDialog.Content
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        transform: 'translate(-50%, -50%)',
      }}
      className="bg-bg p-4 shadow-lg"
      {...props}
    />
  )
}
