import React from 'react'
import { Button } from '../design-system'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../settingsStore'
import { useGameContext } from '../GameContext'

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
  const positionClass = {
    top: 'top-0 left-0 right-0 w-full',
    bottom: 'bottom-0 left-0 right-0 w-full',
    left: 'left-0 top-0 bottom-0 h-full',
    right: 'right-0 top-0 bottom-0 h-full'
  }[navPosition]

  return (
    <nav
      className={`fixed z-10 bg-bg p-2 flex gap-2 justify-around ${
        vertical ? 'flex-col ' : 'flex-row '
      }${positionClass}`}
    >
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
  )
}

