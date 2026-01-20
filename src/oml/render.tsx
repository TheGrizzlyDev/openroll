/* eslint react-hooks/rules-of-hooks: off */
import { useGameContext } from '../stores/GameContext'
import { parseOml, type OmlNode, type ApplyNode } from './parser'
import React from 'react'
import InventoryLookup from '../components/InventoryLookup'
import { Button } from '../components/ui'

export function RenderNodes(
  nodes: OmlNode[],
  ctx: { roll: (_notation: string) => unknown; applyEffect: (_node: ApplyNode) => unknown }
) {
  return nodes.map((node, i) => {
    if (node.type === 'dice') {
      const label = node.description ?? node.notation
      return (
        <Button type="button" key={i} onClick={() => ctx.roll(node.notation)}>
          {label}
        </Button>
      )
    }
    if (node.type === 'apply') {
      const label = node.description ?? `${node.target} ${node.value}`
      return (
        <Button type="button" key={i} onClick={() => ctx.applyEffect(node)}>
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
              {RenderNodes(br.children, ctx)}
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
    if (node.type === 'name') {
      const { state } = useGameContext.getState()
      return <React.Fragment key={i}>{state.sheet.name}</React.Fragment>
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
      <span key={i} style={{ whiteSpace: 'break-spaces' }}>
        {parts.map((part, idx) =>
          /\r?\n/.test(part) ? <br key={idx} /> : <React.Fragment key={idx}>{part}</React.Fragment>
        )}
      </span>
    )
  })
}

export function RenderOml(text: string, rollFn?: (_notation: string) => unknown) {
  const { roll, applyEffect } = useGameContext.getState()
  const doRoll = rollFn ?? roll
  const nodes = parseOml((text || '').trim())
  return <>{RenderNodes(nodes, { roll: doRoll, applyEffect })}</>
}

