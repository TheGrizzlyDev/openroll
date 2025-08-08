import type { Preview } from '@storybook/react-vite'
import './preview.css'
import { ThemeProvider } from '../src/theme/ThemeProvider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'default',
      toolbar: {
        items: [
          { value: 'default', title: 'Default' },
          { value: 'mork_borg', title: 'Mork Borg' },
          { value: 'ose', title: 'OSE' }
        ],
      },
    },
  },
  decorators: [
    (Story, { globals }) => (
      <ThemeProvider game={globals.theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
