import type { ReactNode } from 'react'
import { ark } from '@ark-ui/react'
import Stack from './Stack'
import Flex from './Flex'

interface SectionProps {
  title: string
  actions?: ReactNode
  children?: ReactNode
}

export default function Section({ title, actions, children }: SectionProps) {
  return (
    <Stack asChild gap="1rem">
      <ark.section>
        <Flex justify="space-between" align="center">
          <h2>{title}</h2>
          {actions && <Flex gap="0.5rem">{actions}</Flex>}
        </Flex>
        {children}
      </ark.section>
    </Stack>
  )
}
