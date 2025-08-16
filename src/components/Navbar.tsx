import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../design-system'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSettingsStore, type ButtonVariant } from '../stores/settingsStore'
import { useGameContext } from '../stores/GameContext'
import { Flex } from '@radix-ui/themes'

type StartTab = 'characters' | 'dices' | 'trays' | 'settings'

const tabs: { id: StartTab; label: string }[] = [
  { id: 'characters', label: 'Characters' },
  { id: 'dices', label: 'Dices' },
  { id: 'trays', label: 'Trays' },
  { id: 'settings', label: 'Settings' }
]

export default function Navbar() {
  const {
    navPosition,
    navBgColorLight,
    navBgColorDark,
    navBgOpacityLight,
    navBgOpacityDark,
    navCornerRadius,
    navShadowColorLight,
    navShadowColorDark,
    navShadowOpacityLight,
    navShadowOpacityDark,
    navAnimationDuration,
    navButtonVariant,
    navActiveButtonVariant,
    theme: themeMode,
  } = useSettingsStore(state => ({
    navPosition: state.navPosition,
    navBgColorLight: state.navBgColorLight,
    navBgColorDark: state.navBgColorDark,
    navBgOpacityLight: state.navBgOpacityLight,
    navBgOpacityDark: state.navBgOpacityDark,
    navCornerRadius: state.navCornerRadius,
    navShadowColorLight: state.navShadowColorLight,
    navShadowColorDark: state.navShadowColorDark,
    navShadowOpacityLight: state.navShadowOpacityLight,
    navShadowOpacityDark: state.navShadowOpacityDark,
    navAnimationDuration: state.navAnimationDuration,
    navButtonVariant: state.navButtonVariant,
    navActiveButtonVariant: state.navActiveButtonVariant,
    theme: state.theme,
  }))

  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useGameContext()
  const { current } = state
  const pathname = location.pathname
  const activeTab = pathname.startsWith('/sheet/')
    ? 'characters'
    : (pathname.split('/')[1] as StartTab)

  const vertical = navPosition === 'left' || navPosition === 'right'

  const [appearance, setAppearance] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => setAppearance(mq.matches ? 'dark' : 'light')
    if (themeMode === 'auto') {
      apply()
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    } else {
      setAppearance(themeMode)
    }
  }, [themeMode])

  const bgColor = appearance === 'dark' ? navBgColorDark : navBgColorLight
  const opacity = appearance === 'dark' ? navBgOpacityDark : navBgOpacityLight
  const background = `rgba(${hexToRgb(bgColor)}, ${opacity})`
  const shadowColor =
    appearance === 'dark' ? navShadowColorDark : navShadowColorLight
  const shadowOpacity =
    appearance === 'dark' ? navShadowOpacityDark : navShadowOpacityLight
  const boxShadowColor = `rgba(${hexToRgb(shadowColor)}, ${shadowOpacity})`

  const navRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = () => {
      if (navRef.current) {
        const styles = getComputedStyle(navRef.current)
        const footprint =
          navRef.current.offsetHeight +
          parseFloat(styles.marginTop) +
          parseFloat(styles.marginBottom)
        document.documentElement.style.setProperty(
          '--navbar-footprint',
          `${footprint}px`
        )
        document.documentElement.style.setProperty(
          '--navbar-padding-bottom',
          navPosition === 'bottom' ? `${footprint * 2}px` : '0px'
        )
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [navPosition])

  let style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10,
    padding: 'var(--space-2)',
    gap: 'var(--space-2)',
    borderRadius: `${navCornerRadius}px`,
    backdropFilter: 'blur(10px)',
    background,
    boxShadow: `0 2px 6px ${boxShadowColor}`,
    transition: `opacity ${navAnimationDuration}ms, transform ${navAnimationDuration}ms`,
  }

  let visibleTransform = ''
  if (navPosition === 'top') {
    style = {
      ...style,
      top: '1rem',
      left: '50%',
      width: 'calc(100% - 2rem)',
      maxWidth: '800px',
    }
    visibleTransform = 'translateX(-50%)'
  } else if (navPosition === 'bottom') {
    style = {
      ...style,
      bottom: '1rem',
      left: '50%',
      width: 'calc(100% - 2rem)',
      maxWidth: '800px',
    }
    visibleTransform = 'translateX(-50%)'
  } else if (navPosition === 'left') {
    style = { ...style, left: '1rem', top: '50%' }
    visibleTransform = 'translateY(-50%)'
  } else if (navPosition === 'right') {
    style = { ...style, right: '1rem', top: '50%' }
    visibleTransform = 'translateY(-50%)'
  }

  style.transform = visibleTransform

  return (
    <Flex
      ref={navRef}
      asChild
      direction={vertical ? 'column' : 'row'}
      justify="between"
      style={style}
    >
      <nav>
        {tabs.map(tab => (
          <Button
            key={tab.id}
            {...buttonProps(
              activeTab === tab.id
                ? navActiveButtonVariant
                : navButtonVariant,
              activeTab === tab.id
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
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
          >
            {tab.label}
          </Button>
        ))}
      </nav>
    </Flex>
  )
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const num = parseInt(normalized, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r},${g},${b}`
}

function buttonProps(variant: ButtonVariant, active = false) {
  if (variant === 'ghost') {
    return {
      variant: 'surface' as ButtonVariant,
      style: {
        backgroundColor: active ? 'var(--accent-9)' : 'transparent',
        boxShadow: 'none',
        color: active ? 'var(--accent-1)' : 'inherit',
      },
    }
  }
  return { variant }
}

