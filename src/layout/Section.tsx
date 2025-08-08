import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  actions?: ReactNode
  children?: ReactNode
}

export default function Section({ title, actions, children }: SectionProps) {
  return (
    <section className="section">
      <header className="section-header">
        <h2>{title}</h2>
        {actions && <div className="section-actions">{actions}</div>}
      </header>
      {children}
    </section>
  )
}
