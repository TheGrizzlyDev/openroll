import { forwardRef } from 'react'
import { TextArea, type TextAreaProps } from '@radix-ui/themes'

export type TextareaProps = TextAreaProps

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => (
  <TextArea ref={ref} {...props} />
))

export default Textarea
