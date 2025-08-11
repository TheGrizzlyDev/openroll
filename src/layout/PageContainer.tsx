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
    <Stack style={{ marginInline: 'auto', maxWidth: '800px', padding: '1rem 1rem 0' }}>
      {(title || headerActions) && (
        <Flex justify="space-between" align="center">
          {title && <h1>{title}</h1>}
          {headerActions && <Flex gap="0.5rem">{headerActions}</Flex>}
        </Flex>
      )}
      {children}
      <div
        aria-hidden="true"
        style={{ height: 'calc(1rem + var(--navbar-padding-bottom, 0))' }}
      />
    </Stack>
  )
}
