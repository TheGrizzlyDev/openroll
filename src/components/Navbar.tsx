import React from 'react'
import { Button } from '../design-system'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../settingsStore'
import { useGameContext } from '../GameContext'
import { Flex } from '@radix-ui/themes'

type StartTab = 'characters' | 'dices' | 'trays' | 'settings'

const tabs: { id: StartTab; label: string }[] = [
  { id: 'characters', label: 'Characters' },
  { id: 'dices', label: 'Dices' },
  { id: 'trays', label: 'Trays' },
  { id: 'settings', label: 'Settings' }
]

export default function Navbar() {
  const navPosition = useSettingsStore(state => state.navPosition)
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useGameContext()
  const { current } = state
  const pathname = location.pathname
  const activeTab = pathname.startsWith('/sheet/')
    ? 'characters'
    : (pathname.split('/')[1] as StartTab)

  const vertical = navPosition === 'left' || navPosition === 'right'

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10,
    background: 'var(--color-background)',
    padding: 'var(--space-2)',
    gap: 'var(--space-2)',
    ...(navPosition === 'top' && { top: 0, left: 0, right: 0 }),
    ...(navPosition === 'bottom' && { bottom: 0, left: 0, right: 0 }),
    ...(navPosition === 'left' && { left: 0, top: 0, bottom: 0 }),
    ...(navPosition === 'right' && { right: 0, top: 0, bottom: 0 }),
  }

  return (
    <Flex
      asChild
      direction={vertical ? 'column' : 'row'}
      justify="between"
      style={style}
    >
      <nav>
        {tabs.map(tab => (
          <Button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'characters') {
                if (current !== null) {
                  navigate(`/sheet/${current}`)
                } else {
                  navigate('/characters')
                }
              } else {
                navigate('/' + tab.id)
              }
            }}
            disabled={activeTab === tab.id}
          >
            {tab.label}
          </Button>
        ))}
      </nav>
    </Flex>
  )
}

