/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useEffect } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { useFloating } from '@floating-ui/react'

const Backdrop = (props: RadixDialog.DialogOverlayProps) => (
  <RadixDialog.Overlay className="fixed inset-0 bg-black/50" {...props} />
)

const Positioner = ({ children }: { children: ReactNode }) => (
  <RadixDialog.Portal>{children}</RadixDialog.Portal>
)

const Content = (props: RadixDialog.DialogContentProps) => {
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
        right: window.innerWidth / 2
      })
    })
  }, [refs])

  return (
    <RadixDialog.Content
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        transform: 'translate(-50%, -50%)'
      }}
      className="bg-bg p-4 shadow-lg"
      {...props}
    />
  )
}

export const Dialog = {
  Root: RadixDialog.Root,
  Backdrop,
  Positioner,
  Content,
  CloseTrigger: RadixDialog.Close
}

export default Dialog
