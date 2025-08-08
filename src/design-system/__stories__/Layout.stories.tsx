/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { PageContainer, Section } from '../../layout'
import { Button } from '../Button'

const meta: Meta<typeof PageContainer> = {
  title: 'Design System/Layout',
  component: PageContainer,
}

export default meta

type Story = StoryObj<typeof PageContainer>

export const Default: Story = {
  render: () => (
    <PageContainer title="Page Title">
      <Section title="Section Title" actions={<Button>Action</Button>}>
        Content goes here.
      </Section>
    </PageContainer>
  ),
}
