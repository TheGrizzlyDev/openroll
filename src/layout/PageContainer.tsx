import type { ReactNode } from 'react'
import Stack from './Stack'
import Flex from './Flex'

interface PageContainerProps {
  title?: ReactNode
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
      {(title || headerActions) && (
        <Flex justify="space-between" align="center">
          {title && <h1>{title}</h1>}
          {headerActions && <Flex gap="0.5rem">{headerActions}</Flex>}
        </Flex>
      )}
      {children}
    </Stack>
  )
}
