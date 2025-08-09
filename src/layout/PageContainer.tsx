import type { ReactNode } from 'react'

interface PageContainerProps {
  title: string
  startScreen?: boolean
  headerActions?: ReactNode
  children: ReactNode
}

export default function PageContainer({
  title,
  startScreen = false,
  headerActions,
  children
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto max-w-[800px] p-4${startScreen ? ' start-screen' : ''}`}
    >
      <header className="page-header">
        <h1>{title}</h1>
        {headerActions && <div className="page-header-actions">{headerActions}</div>}
      </header>
      {children}
    </div>
  )
}
