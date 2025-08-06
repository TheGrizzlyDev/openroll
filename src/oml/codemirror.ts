import { StreamLanguage, type StreamParser } from '@codemirror/language'
import type { CompletionSource, CompletionContext } from '@codemirror/autocomplete'

interface OmlState {
  inTag: boolean
  seenName: boolean
  tagName: string
}

const tagNames = ['dice', 'link', 'apply', 'inventory', 'if', 'elif', 'else', 'fi']

export const omlParser: StreamParser<OmlState> = {
  startState() {
    return { inTag: false, seenName: false, tagName: '' }
  },
  token(stream, state) {
    if (!state.inTag) {
      if (stream.match('[', true)) {
        state.inTag = true
        state.seenName = false
        state.tagName = ''
        return 'bracket'
      }
      stream.next()
      return null
    }
    if (stream.match(']', true)) {
      state.inTag = false
      return 'bracket'
    }
    if (!state.seenName) {
      if (stream.eatSpace()) return null
      if (stream.eatWhile(/[\w-]/)) {
        const name = stream.current().toLowerCase()
        state.seenName = true
        state.tagName = name
        return tagNames.includes(name) ? 'keyword' : 'atom'
      }
      stream.next()
      return null
    }
    if (stream.eatSpace()) return null
    if (stream.match(/"(?:[^"\\]|\\.)*"/)) return 'string'
    if (stream.match(/'(?:[^'\\]|\\.)*'/)) return 'string'
    if (stream.match(/^[\w-]+(?==)/)) return 'property'
    if (stream.match('=')) return 'operator'
    if (stream.eatWhile(/[^\s\]]/)) return 'atom'
    stream.next()
    return null
  }
}

export const omlLanguage = StreamLanguage.define(omlParser)

const tagAttributes: Record<string, string[]> = {
  dice: ['kind'],
  link: ['url'],
  apply: ['target', 'value', 'subject'],
  inventory: ['type', 'owned'],
  if: ['predicate']
}

export const omlCompletion: CompletionSource = (context: CompletionContext) => {
  const before = context.state.sliceDoc(0, context.pos)
  const start = before.lastIndexOf('[')
  const end = before.lastIndexOf(']')
  if (start > end) {
    const text = before.slice(start + 1)
    const parts = text.split(/\s+/)
    if (parts.length <= 1) {
      return {
        from: start + 1,
        options: tagNames.map(t => ({ label: t, type: 'keyword' }))
      }
    }
    const tag = parts[0]
    const attrs = tagAttributes[tag]
    if (!attrs) return null
    const last = parts[parts.length - 1]
    const eq = last.indexOf('=')
    const from = context.pos - (eq === -1 ? last.length : eq)
    return {
      from,
      options: attrs.map(a => ({ label: a, type: 'property' }))
    }
  }
  return null
}
