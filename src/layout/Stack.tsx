import Flex, { type FlexProps } from './Flex'

export type StackProps = FlexProps

export function Stack({ direction = 'column', ...props }: StackProps) {
  return <Flex direction={direction} {...props} />
}

export default Stack
