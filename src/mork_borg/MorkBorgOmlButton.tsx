import React from 'react'

interface MorkBorgOmlButtonProps {
    onClick: () => void
    children: React.ReactNode
}

export function MorkBorgOmlButton({ onClick, children }: MorkBorgOmlButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                background: '#000',
                color: '#F7D02C',
                border: '3px solid #F7D02C',
                padding: '0.5rem 1rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
                display: 'inline-block'
            }}
        >
            {children}
        </button>
    )
}
