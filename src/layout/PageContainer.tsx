import type { ReactNode } from 'react'
import Stack from './Stack'
import Flex from './Flex'

interface PageContainerProps {
  title: string
  headerActions?: ReactNode
  children: ReactNode
}

export default function PageContainer({
  title,
  headerActions,
  children
}: PageContainerProps) {
  return (
    <Stack style={{ marginInline: 'auto', maxWidth: '800px', padding: '1rem' }}>
      <Flex justify="space-between" align="center">
        <h1>{title}</h1>
        {headerActions && <Flex gap="0.5rem">{headerActions}</Flex>}
      </Flex>
      {children}
    </Stack>
  )
}
