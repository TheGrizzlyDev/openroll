import { describe, it, expect } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadNameData } from '../vite-plugin-name-bundle'

describe('name tag index', () => {
  it('has expected tag keys and values', () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const root = path.join(__dirname, 'fixtures')
    const { tagIndex } = loadNameData(root)
    expect(tagIndex.class).toEqual(['first', 'last'])
    expect(tagIndex.ethnicity).toEqual(['general', 'spanish'])
  })
})
