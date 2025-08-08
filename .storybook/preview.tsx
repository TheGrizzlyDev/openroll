import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
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
  decorators: [
    Story => (
      <ThemeProvider game="mork_borg">
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
