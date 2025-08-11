import type { CSSProperties, HTMLAttributes } from 'react'

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  gap?: CSSProperties['gap']
  justify?: CSSProperties['justifyContent']
  align?: CSSProperties['alignItems']
  direction?: CSSProperties['flexDirection']
  wrap?: CSSProperties['flexWrap']
}

export function Flex({
  gap,
  justify,
  align,
  direction,
  wrap,
  style,
  ...props
}: FlexProps) {
  return (
    <div
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
}

export default Flex
