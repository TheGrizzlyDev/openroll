/* eslint react-refresh/only-export-components: off, react-hooks/rules-of-hooks: off */
import { useGameContext } from '../GameContext'
import { parseOml, type OmlNode, type ApplyNode } from './parser'
import React from 'react'
import InventoryLookup from '../components/InventoryLookup'
import { Button } from '../ui'

export function renderNodes(
  nodes: OmlNode[],
  ctx: { roll: (_notation: string) => unknown; applyEffect: (_node: ApplyNode) => unknown }
) {
  return nodes.map((node, i) => {
    if (node.type === 'dice') {
      const label = node.description ?? node.notation
      return (
        <Button
          type="button"
          key={i}
          className="badge"
          onClick={() => ctx.roll(node.notation)}
        >
          {label}
        </Button>
      )
    }
    if (node.type === 'apply') {
      const label = node.description ?? `${node.target} ${node.value}`
      return (
        <Button
          type="button"
          key={i}
          className="badge"
          onClick={() => ctx.applyEffect(node)}
        >
          {label}
        </Button>
      )
    }
    if (node.type === 'if') {
      const { state } = useGameContext.getState()
      let active = -1
      for (let b = 0; b < node.branches.length; b++) {
        const br = node.branches[b]
        if (br.type === 'else') {
          if (active === -1) active = b
          break
        }
        if (br.predicate) {
          try {
            const fn = new Function('state', `with(state){with(state.sheet){return (${br.predicate});}}`)
            if (fn(state)) {
              active = b
              break
            }
          } catch {
            // ignore errors and treat as false
          }
        }
      }
      if (active === -1) active = node.branches.findIndex(br => br.type === 'else')
      return (
        <React.Fragment key={i}>
          {node.branches.map((br, idx) => (
            <span key={idx} style={idx === active ? undefined : { opacity: 0.5 }}>
              {renderNodes(br.children, ctx)}
            </span>
          ))}
        </React.Fragment>
      )
    }
    if (node.type === 'inventory') {
      return (
        <InventoryLookup
          key={i}
          description={node.description}
          attrs={node.attrs}
        />
      )
    }
    if (node.type === 'link') {
      const label = node.description ?? node.text
      return (
        <a key={i} href={node.url}>
          {label}
        </a>
      )
    }
    const parts = node.text.split(/(\r?\n)/)
    return (
      <span key={i}>
        {parts.map((part, idx) =>
          /\r?\n/.test(part) ? <br key={idx} /> : <React.Fragment key={idx}>{part}</React.Fragment>
        )}
      </span>
    )
  })
}

export function renderOml(text: string, rollFn?: (_notation: string) => unknown) {
  const { roll, applyEffect } = useGameContext.getState()
  const doRoll = rollFn ?? roll
  const nodes = parseOml(text)
  return <>{renderNodes(nodes, { roll: doRoll, applyEffect })}</>
}

export { parseOml, type OmlNode } from './parser'
