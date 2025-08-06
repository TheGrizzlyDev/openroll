/* eslint react-refresh/only-export-components: off, react-hooks/rules-of-hooks: off */
import { useGameContext } from '../GameContext'
import { parseOml, type OmlNode } from './parser'
import React from 'react'
import InventoryLookup from '../components/InventoryLookup'
import { Button } from '../ui'

export function renderNodes(nodes: OmlNode[], roll: (_notation: string) => unknown) {
  return nodes.map((node, i) => {
    if (node.type === 'dice') {
      const label = node.description ?? node.notation
      return (
        <Button
          type="button"
          key={i}
          className="badge"
          onClick={() => roll(node.notation)}
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
              {renderNodes(br.children, roll)}
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
    return <span key={i}>{node.text}</span>
  })
}

export function renderOml(text: string, rollFn?: (_notation: string) => unknown) {
  const doRoll = rollFn ?? useGameContext().roll
  const nodes = parseOml(text)
  return <>{renderNodes(nodes, doRoll)}</>
}

export { parseOml, type OmlNode } from './parser'
