export type OmlNode =
  | { type: 'text', text: string }
  | { type: 'dice', notation: string }

export function parseOml(input: string): OmlNode[] {
  const nodes: OmlNode[] = []
  const regex = /\[([^\]]+)\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: input.slice(lastIndex, match.index) })
    }
    const content = match[1].trim()
    if (content.startsWith('dice ')) {
      const notation = content.slice(5).trim()
      nodes.push({ type: 'dice', notation })
    } else {
      nodes.push({ type: 'text', text: match[0] })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < input.length) {
    nodes.push({ type: 'text', text: input.slice(lastIndex) })
  }

  return nodes
}
