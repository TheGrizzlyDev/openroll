import {
  StreamLanguage,
  type StreamParser,
  syntaxHighlighting,
  HighlightStyle
} from '@codemirror/language'
import type { CompletionSource, CompletionContext } from '@codemirror/autocomplete'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { background } from 'storybook/internal/theming'

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

export const omlHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--syntax-keyword)' },
  { tag: tags.atom, color: 'var(--syntax-atom)' },
  { tag: tags.string, color: 'var(--syntax-string)' },
  { tag: tags.propertyName, color: 'var(--syntax-property)' },
  { tag: tags.operator, color: 'var(--syntax-operator)' },
  { tag: tags.bracket, color: 'var(--syntax-bracket)' }
])

export const omlHighlight = syntaxHighlighting(omlHighlightStyle)

export const omlTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-bg-alt) !important',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    border: 'var(--border-width, 1px) solid var(--color-accent)',
    borderRadius: 'var(--border-radius, 0)',
    transition: 'box-shadow 0.2s',
    width: '100%',
    '--syntax-keyword':
      'color-mix(in srgb, var(--color-accent), var(--color-text) 30%)',
    '--syntax-atom': 'color-mix(in srgb, #9333ea, var(--color-text) 30%)',
    '--syntax-string': 'color-mix(in srgb, #16a34a, var(--color-text) 30%)',
    '--syntax-property': 'color-mix(in srgb, #dc2626, var(--color-text) 30%)',
    '--syntax-operator': 'color-mix(in srgb, var(--color-text), transparent 5%)',
    '--syntax-bracket': 'color-mix(in srgb, var(--color-text), transparent 5%)',
    
  },
  '.cm-content': {
    fontFamily: 'var(--font-body)'
  },
  '.cm-activeLine': {
    backgroundColor: '#efefef20'
  },
  '.cm-gutters': {
    backgroundColor: 'color-min(in srgb, var(--color-bg-alt), #202020 20%)',
    color: 'var(--color-text)'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#202020 !important',
    color: 'var(--color-text)'
  },
  '&.cm-focused': {
    boxShadow: '0 0 5px var(--color-accent)',
    outline: 'none'
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--color-text)'
  }
})

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
