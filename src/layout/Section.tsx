import type { ReactNode } from 'react'
import Flex from './Flex'

interface SectionProps {
  title: string
  actions?: ReactNode
  children?: ReactNode
}

export default function Section({ title, actions, children }: SectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Flex justify="space-between" align="center">
        <h2>{title}</h2>
        {actions && <Flex gap="0.5rem">{actions}</Flex>}
      </Flex>
      {children}
    </section>
  )
}
