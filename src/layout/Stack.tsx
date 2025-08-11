import { forwardRef, type CSSProperties } from 'react'
import Flex, { type FlexProps } from './Flex'

export interface StackProps extends FlexProps {
  direction?: CSSProperties['flexDirection']
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ direction = 'column', ...props }, ref) => (
    <Flex ref={ref} direction={direction} {...props} />
  )
)

export default Stack
