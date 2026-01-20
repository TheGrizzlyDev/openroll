export const themes = {
  light: {
    colors: {
      bg: '#ffffff',
      bgAlt: '#f0f0f0',
      surface: '#ffffff',
      surfaceDim: '#f5f5f5',
      text: '#000000',
      textDim: '#666666',
      accent: '#2563eb', // Bright blue
      border: '#e5e7eb',
      error: '#dc2626',
    },
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
    },
    borderWidth: '1px',
    borderRadius: '8px',
  },
  dark: {
    colors: {
      bg: '#000000',
      bgAlt: '#111111',
      surface: '#000000',
      surfaceDim: '#222222',
      text: '#E8E815', // Mork Borg Yellow
      textDim: '#cccccc',
      accent: '#E8E815',
      border: '#E8E815',
      error: '#dc2626',
    },
    fonts: {
      body: 'Cinzel, serif',
      heading: 'Cinzel, serif',
    },
    borderWidth: '1px',
    borderRadius: '0px',
  },
  nexus: {
    colors: {
      bg: '#0f131a', // Dark blue-black
      bgAlt: '#111111',
      surface: '#1c212c', // Card background
      surfaceDim: '#2d3340',
      text: '#f5f5f5',
      textDim: '#94a3b8',
      accent: '#2563eb', // Royal Blue
      border: '#2d3340',
      error: '#ef4444',
    },
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
    },
    borderWidth: '1px',
    borderRadius: '12px',
  },
} as const

export type ThemeName = keyof typeof themes

export function applyTheme(name: ThemeName) {
  const theme = themes[name]
  const root = document.documentElement
  root.style.setProperty('--color-bg', theme.colors.bg)
  root.style.setProperty('--color-bg-alt', theme.colors.bgAlt)
  root.style.setProperty('--color-surface', theme.colors.surface)
  root.style.setProperty('--color-surface-dim', theme.colors.surfaceDim)
  root.style.setProperty('--color-text', theme.colors.text)
  root.style.setProperty('--color-text-dim', theme.colors.textDim)
  root.style.setProperty('--color-accent', theme.colors.accent)
  root.style.setProperty('--color-border', theme.colors.border)
  root.style.setProperty('--color-error', theme.colors.error)
  root.style.setProperty('--font-body', theme.fonts.body)
  root.style.setProperty('--font-heading', theme.fonts.heading)
  root.style.setProperty('--border-width', theme.borderWidth)
  root.style.setProperty('--border-radius', theme.borderRadius)
  root.style.setProperty('--font-size-sm', '0.875rem')
}
