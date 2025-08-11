import { forwardRef, type CSSProperties } from 'react'
import { ark, type HTMLArkProps } from '@ark-ui/react'

export interface FlexProps extends HTMLArkProps<'div'> {
  gap?: CSSProperties['gap']
  justify?: CSSProperties['justifyContent']
  align?: CSSProperties['alignItems']
  direction?: CSSProperties['flexDirection']
  wrap?: CSSProperties['flexWrap']
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ gap, justify, align, direction, wrap, style, ...props }, ref) => (
    <ark.div
      ref={ref}
      {...props}
      style={{
        display: 'flex',
        gap,
        justifyContent: justify,
        alignItems: align,
        flexDirection: direction,
        flexWrap: wrap,
        ...style
      }}
    />
  )
)

export default Flex
