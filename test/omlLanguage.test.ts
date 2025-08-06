import { describe, it, expect } from 'vitest'
import { StringStream } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { CompletionContext } from '@codemirror/autocomplete'
import { omlParser, omlCompletion } from '../src/oml/codemirror'

describe('oml codemirror language', () => {
  it('tokenizes dice tag', () => {
    const state = omlParser.startState ? omlParser.startState(0) : ({} as any)
    const stream = new StringStream('[dice "1d4" 1d4]', 0, 0)
    const styles: string[] = []
    while (!stream.eol()) {
      stream.start = stream.pos
      const style = omlParser.token(stream, state)
      if (style) styles.push(style)
    }
    expect(styles).toContain('keyword')
    expect(styles).toContain('string')
  })

  it('suggests tag names', () => {
    const doc = '['
    const state = EditorState.create({ doc })
    const ctx = new CompletionContext(state, doc.length, false)
    const res = omlCompletion(ctx) as any
    expect(res?.options.some((o: any) => o.label === 'dice')).toBe(true)
  })

  it('suggests attributes', () => {
    const doc = '[dice '
    const state = EditorState.create({ doc })
    const ctx = new CompletionContext(state, doc.length, false)
    const res = omlCompletion(ctx) as any
    expect(res?.options.some((o: any) => o.label === 'kind')).toBe(true)
  })
})
