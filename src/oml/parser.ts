export type OmlNode =
  | { type: 'text'; text: string }
  | { type: 'link'; url: string; text: string; description?: string }
  | { type: 'dice'; notation: string; description?: string; attrs: Record<string, string> }
  | { type: 'if'; branches: IfBranch[]; description?: string; attrs: Record<string, string> }
  | { type: 'inventory'; description?: string; attrs: Record<string, string> }
  | ApplyNode

export interface ApplyNode {
  type: 'apply'
  description?: string
  target: string
  value: string
  subject?: string
  attrs: Record<string, string>
}

export interface IfBranch {
  type: 'if' | 'elif' | 'else'
  description?: string
  predicate?: string
  attrs: Record<string, string>
  children: OmlNode[]
}

interface ParsedTag {
  name: string
  args: string[]
  description?: string
  attrs: Record<string, string>
}

function tokenizeTag(content: string): ParsedTag {
  const tokens: { text: string; quoted: boolean }[] = []
  let current = ''
  let quote: string | null = null
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (quote) {
      if (ch === quote) {
        tokens.push({ text: current, quoted: true })
        current = ''
        quote = null
      } else {
        current += ch
      }
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push({ text: current, quoted: false })
        current = ''
      }
      continue
    }
    current += ch
  }
  if (current) tokens.push({ text: current, quoted: false })

  const name = tokens.shift()?.text.toLowerCase() ?? ''
  let description: string | undefined
  if (tokens[0]?.quoted) {
    description = tokens.shift()!.text
  }

  const args: string[] = []
  const attrs: Record<string, string> = {}
  for (const token of tokens) {
    if (!token.quoted && /^[^=]+=[^=]+$/.test(token.text)) {
      const eq = token.text.indexOf('=')
      const key = token.text.slice(0, eq)
      const value = token.text.slice(eq + 1)
      attrs[key] = value
    } else {
      args.push(token.text)
    }
  }

  return { name, args, description, attrs }
}

export function parseOml(input: string): OmlNode[] {
  function parseSequence(pos: number, stop: string[] = []): {
    nodes: OmlNode[]
    pos: number
    nextTag?: ParsedTag
  } {
    const nodes: OmlNode[] = []
    let i = pos
    while (i < input.length) {
      if (input[i] === '[') {
        const start = i
        const end = input.indexOf(']', i)
        if (end === -1) {
          nodes.push({ type: 'text', text: input.slice(i) })
          return { nodes, pos: input.length }
        }
        const tag = tokenizeTag(input.slice(i + 1, end))
        if (stop.includes(tag.name)) {
          return { nodes, pos: end + 1, nextTag: tag }
        }
        i = end + 1
        if (tag.name === 'dice') {
          nodes.push({
            type: 'dice',
            notation: tag.args[0] ?? '',
            description: tag.description,
            attrs: tag.attrs
          })
        } else if (tag.name === 'apply') {
          const description = tag.description
          const target = tag.args[0] || ''
          const rest = tag.args.slice(1)
          let value = rest[0] || ''
          let subject: string | undefined
          if (target === 'item' || target === 'condition') {
            subject = rest[0]
            value = rest[1] || ''
          }
          nodes.push({
            type: 'apply',
            description,
            target,
            subject,
            value,
            attrs: tag.attrs
          })
        } else if (tag.name === 'if') {
          const result = parseIf(tag, i)
          nodes.push(result.node)
          i = result.pos
        } else if (tag.name === 'inventory') {
          nodes.push({
            type: 'inventory',
            description: tag.description,
            attrs: tag.attrs
          })
        } else if (tag.name === 'link') {
          nodes.push({
            type: 'link',
            url: tag.args[0] ?? '',
            text: tag.args[1] ?? '',
            description: tag.description
          })
        } else {
          nodes.push({ type: 'text', text: input.slice(start, end + 1) })
        }
      } else {
        const next = input.indexOf('[', i)
        const text = next === -1 ? input.slice(i) : input.slice(i, next)
        nodes.push({ type: 'text', text })
        i = next === -1 ? input.length : next
      }
    }
    return { nodes, pos: i }
  }

  function parseIf(tag: ParsedTag, pos: number): { node: OmlNode; pos: number } {
    const branches: IfBranch[] = []
    let currentTag: ParsedTag | undefined = tag
    let i = pos
    while (currentTag) {
      const branch: IfBranch = {
        type: currentTag.name as IfBranch['type'],
        description: currentTag.description,
        predicate: currentTag.args[0],
        attrs: currentTag.attrs,
        children: []
      }
      const result = parseSequence(i, ['elif', 'else', 'fi'])
      branch.children = result.nodes
      branches.push(branch)
      i = result.pos
      currentTag = result.nextTag
      if (!currentTag || currentTag.name === 'fi') {
        break
      }
    }
    return {
      node: { type: 'if', branches, description: tag.description, attrs: tag.attrs },
      pos: i
    }
  }

  return parseSequence(0).nodes
}

