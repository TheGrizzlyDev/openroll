import { type ReactNode } from 'react'
import { Flex } from '../layout'

interface SystemCardProps {
    title: string
    description: string
    image?: ReactNode
    onClick: () => void
    selected?: boolean
}

export function SystemCard({ title, description, image, onClick, selected }: SystemCardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'var(--color-surface)',
                border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: selected ? '0 0 0 2px var(--color-accent)' : 'none',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--color-surface-dim)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-dim)',
                    fontSize: '2rem'
                }}
            >
                {image}
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{title}</h3>
                <p
                    style={{
                        margin: 0,
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-dim)',
                        lineHeight: 1.4
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    )
}
