import { expect, afterEach } from 'vitest'
import process from 'node:process'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

interface TaskMeta {
  meta?: { timeout?: number }
  duration?: number
  name: string
}

afterEach(ctx => {
  const task = ctx.task as TestTask
  const timeout = task.meta?.timeout ?? 10_000
  const duration = task.duration
  if (typeof timeout === 'number' && typeof duration === 'number' && duration > timeout) {
    console.warn(`⚠️ Test "${task.name}" exceeded timeout of ${timeout}ms (took ${duration}ms)`)
  }
})

process.on('unhandledRejection', reason => {
  console.warn('Unhandled promise rejection:', reason)
})
