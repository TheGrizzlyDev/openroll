import type { CSSProperties } from 'react'
import { Section, Stack } from '../layout'

interface UnderConstructionProps {
  title: string
}

const cardStyle: CSSProperties = {
  background: 'var(--color-bg-alt)',
  border: '1px dashed var(--color-accent)',
  borderRadius: '16px',
  padding: '1.5rem',
  textAlign: 'center',
}

export default function UnderConstruction({ title }: UnderConstructionProps) {
  return (
    <Section title={title}>
      <Stack gap="0.75rem" style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <div data-testid="under-construction" style={cardStyle}>
          <h3>Under Construction</h3>
          <p>We&apos;re building the next set of tools for this space.</p>
          <p>Check back soon for the finished experience.</p>
        </div>
      </Stack>
    </Section>
  )
}
