export const themes = {
  light: {
    colors: {
      bg: '#ffffff',
      bgAlt: '#f0f0f0',
      text: '#000000',
      accent: '#9333ea',
      error: '#dc2626',
    },
    fonts: {
      body: 'Cinzel, serif',
    },
    borderWidth: '1px',
  },
  dark: {
    colors: {
      bg: '#121212',
      bgAlt: '#1e1e1e',
      text: '#f5f5f5',
      accent: '#9333ea',
      error: '#dc2626',
    },
    fonts: {
      body: 'Cinzel, serif',
    },
    borderWidth: '1px',
  },
  nexus: {
    colors: {
      bg: '#121212',
      bgAlt: '#1e1e1e',
      text: '#f5f5f5',
      accent: '#9333ea',
      error: '#dc2626',
    },
    fonts: {
      body: 'Cinzel, serif',
    },
    borderWidth: '1px',
  },
} as const

export type ThemeName = keyof typeof themes

export function applyTheme(name: ThemeName) {
  const theme = themes[name]
  const root = document.documentElement
  root.style.setProperty('--color-bg', theme.colors.bg)
  root.style.setProperty('--color-bg-alt', theme.colors.bgAlt)
  root.style.setProperty('--color-text', theme.colors.text)
  root.style.setProperty('--color-accent', theme.colors.accent)
  root.style.setProperty('--color-error', theme.colors.error)
  root.style.setProperty('--font-body', theme.fonts.body)
  root.style.setProperty('--border-width', theme.borderWidth)
}
