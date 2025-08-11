import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NavPosition = 'left' | 'right' | 'top' | 'bottom'
export type ThemeMode = 'auto' | 'light' | 'dark'
export type AnimationStyle = 'fade' | 'slide' | 'both'
export type ButtonVariant = 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'

interface SettingsState {
  navPosition: NavPosition
  setNavPosition: (_pos: NavPosition) => void
  navBgColorLight: string
  setNavBgColorLight: (_color: string) => void
  navBgColorDark: string
  setNavBgColorDark: (_color: string) => void
  navBgOpacityLight: number
  setNavBgOpacityLight: (_opacity: number) => void
  navBgOpacityDark: number
  setNavBgOpacityDark: (_opacity: number) => void
  navCornerRadius: number
  setNavCornerRadius: (_radius: number) => void
  navShadowColorLight: string
  setNavShadowColorLight: (_color: string) => void
  navShadowColorDark: string
  setNavShadowColorDark: (_color: string) => void
  navShadowOpacityLight: number
  setNavShadowOpacityLight: (_opacity: number) => void
  navShadowOpacityDark: number
  setNavShadowOpacityDark: (_opacity: number) => void
  navHideDelay: number
  setNavHideDelay: (_delay: number) => void
  navAnimationDuration: number
  setNavAnimationDuration: (_duration: number) => void
  navAnimationStyle: AnimationStyle
  setNavAnimationStyle: (_style: AnimationStyle) => void
  navButtonVariant: ButtonVariant
  setNavButtonVariant: (_variant: ButtonVariant) => void
  navActiveButtonVariant: ButtonVariant
  setNavActiveButtonVariant: (_variant: ButtonVariant) => void
  hpBarVariant: ButtonVariant
  setHpBarVariant: (_variant: ButtonVariant) => void
  theme: ThemeMode
  setTheme: (_mode: ThemeMode) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      navPosition: 'bottom',
      setNavPosition: navPosition => set({ navPosition }),
      navBgColorLight: '#ffffff',
      setNavBgColorLight: navBgColorLight => set({ navBgColorLight }),
      navBgColorDark: '#000000',
      setNavBgColorDark: navBgColorDark => set({ navBgColorDark }),
      navBgOpacityLight: 0.7,
      setNavBgOpacityLight: navBgOpacityLight => set({ navBgOpacityLight }),
      navBgOpacityDark: 0.5,
      setNavBgOpacityDark: navBgOpacityDark => set({ navBgOpacityDark }),
      navCornerRadius: 8,
      setNavCornerRadius: navCornerRadius => set({ navCornerRadius }),
      navShadowColorLight: '#000000',
      setNavShadowColorLight: navShadowColorLight =>
        set({ navShadowColorLight }),
      navShadowColorDark: '#000000',
      setNavShadowColorDark: navShadowColorDark => set({ navShadowColorDark }),
      navShadowOpacityLight: 0.1,
      setNavShadowOpacityLight: navShadowOpacityLight =>
        set({ navShadowOpacityLight }),
      navShadowOpacityDark: 0.5,
      setNavShadowOpacityDark: navShadowOpacityDark =>
        set({ navShadowOpacityDark }),
      navHideDelay: 3000,
      setNavHideDelay: navHideDelay => set({ navHideDelay }),
      navAnimationDuration: 200,
      setNavAnimationDuration: navAnimationDuration => set({ navAnimationDuration }),
      navAnimationStyle: 'both',
      setNavAnimationStyle: navAnimationStyle => set({ navAnimationStyle }),
      navButtonVariant: 'ghost',
      setNavButtonVariant: navButtonVariant => set({ navButtonVariant }),
      navActiveButtonVariant: 'surface',
      setNavActiveButtonVariant: navActiveButtonVariant =>
        set({ navActiveButtonVariant }),
      hpBarVariant: 'solid',
      setHpBarVariant: hpBarVariant => set({ hpBarVariant }),
      theme: 'auto',
      setTheme: theme => set({ theme }),
    }),
    { name: 'settings' }
  )
)
