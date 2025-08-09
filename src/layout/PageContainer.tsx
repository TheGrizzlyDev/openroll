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
      <header className="page-header flex items-center justify-between">
        <h1>{title}</h1>
        {headerActions && (
          <div className="page-header-actions flex gap-2">{headerActions}</div>
        )}
      </header>
      {children}
    </div>
  )
}
