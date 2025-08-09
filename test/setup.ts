import { expect, afterEach } from 'vitest'
import process from 'node:process'
import * as matchers from '@testing-library/jest-dom/matchers'
import http from 'node:http'
import https from 'node:https'

expect.extend(matchers)

interface TaskMeta {
  meta?: { timeout?: number }
  duration?: number
  name: string
}

afterEach(ctx => {
  const task = ctx.task as TaskMeta
  const timeout = task.meta?.timeout ?? 10_000
  const duration = task.duration
  if (typeof timeout === 'number' && typeof duration === 'number' && duration > timeout) {
    console.warn(`⚠️ Test "${task.name}" exceeded timeout of ${timeout}ms (took ${duration}ms)`)
  }
})

process.on('unhandledRejection', reason => {
  console.warn('Unhandled promise rejection:', reason)
})

const ALLOWED_NETWORK_URLS: (string | RegExp)[] = []

function isAllowed(url: string) {
  return ALLOWED_NETWORK_URLS.some(entry =>
    typeof entry === 'string' ? url === entry : entry.test(url),
  )
}

function logAndThrow(kind: string, url: string): never {
  const stack = new Error().stack ?? ''
  console.error(`Unexpected ${kind} request to ${url}\n${stack}`)
  throw new Error(`Unexpected ${kind} request to ${url}`)
}

const originalFetch = globalThis.fetch
if (originalFetch) {
  globalThis.fetch = ((input: unknown, init?: unknown) => {
    const url = typeof input === 'string' ? input : (input as { url?: string }).url ?? String(input)
    if (isAllowed(url)) {
      return (originalFetch as (_i: unknown, _j?: unknown) => unknown)(input, init)
    }
    logAndThrow('fetch', url)
  }) as typeof fetch
}

const XHR = globalThis.XMLHttpRequest
if (XHR) {
  const open = XHR.prototype.open
  const openAny = open as unknown as (..._args: unknown[]) => unknown
  XHR.prototype.open = function (method: string, url: string, ..._args: unknown[]) {
    if (isAllowed(url)) {
      return openAny.call(this, method, url, ..._args)
    }
    logAndThrow('XMLHttpRequest', url)
  }
}

function wrapRequest(mod: Record<string, unknown>, name: string) {
  const orig = (mod.request as (..._args: unknown[]) => unknown)
  ;(mod as { request: (..._args: unknown[]) => unknown }).request = function (..._args: unknown[]) {
    const options = _args[0] as unknown
    let url = ''
    if (typeof options === 'string') {
      url = options
    } else if (options && typeof options === 'object') {
      const opts = options as {
        href?: string
        protocol?: string
        hostname?: string
        host?: string
        port?: string | number
        path?: string
        pathname?: string
      }
      if (opts.href) {
        url = opts.href
      } else {
        const protocol = opts.protocol || `${name}:`
        const host = opts.hostname || opts.host || 'localhost'
        const port = opts.port ? `:${opts.port}` : ''
        const path = opts.path || opts.pathname || '/'
        url = `${protocol}//${host}${port}${path}`
      }
    }

    if (isAllowed(url)) {
      return orig.apply(this, _args as never[])
    }
    logAndThrow(name, url)
  }
}

wrapRequest(http, 'http')
wrapRequest(https, 'https')
