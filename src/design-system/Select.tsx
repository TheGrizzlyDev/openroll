import { forwardRef, type SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => (
  <select ref={ref} {...props} />
))

export default Select
