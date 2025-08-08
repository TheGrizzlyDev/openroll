/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'

const StyleGuide = () => (
  <div className="space-y-8 p-4">
    <section>
      <h1 className="text-3xl font-bold">Typography</h1>
      <p className="mb-4">The quick brown fox jumps over the lazy dog.</p>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <p>Body text example showing the base font.</p>
    </section>
    <section>
      <h1 className="text-3xl font-bold">Layout</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-10 bg-bg-alt" />
        <div className="h-10 bg-bg-alt" />
        <div className="h-10 bg-bg-alt" />
      </div>
    </section>
    <section>
      <h1 className="text-3xl font-bold">Theme Colors</h1>
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-bg" />
        <div className="w-12 h-12 bg-bg-alt" />
        <div className="w-12 h-12 bg-accent" />
        <div className="w-12 h-12 bg-error" />
      </div>
    </section>
  </div>
)

const meta: Meta<typeof StyleGuide> = {
  title: 'Docs/StyleGuide',
  component: StyleGuide,
}

export default meta
export const Overview: StoryObj<typeof StyleGuide> = {}
