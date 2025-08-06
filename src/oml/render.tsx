/* eslint react-refresh/only-export-components: off, react-hooks/rules-of-hooks: off */
import { useGameContext } from '../GameContext'
import { parseOml, type OmlNode } from './parser'
import React from 'react'
import InventoryLookup from '../components/InventoryLookup'

export function renderNodes(nodes: OmlNode[], roll: (_notation: string) => unknown) {
  return nodes.map((node, i) => {
    if (node.type === 'dice') {
      const label = node.description ?? node.notation
      return (
        <button
          type="button"
          key={i}
          className="badge base-button"
          onClick={() => roll(node.notation)}
        >
          {label}
        </button>
      )
    }
    if (node.type === 'if') {
      const branch = node.branches[0]
      return (
        <React.Fragment key={i}>
          {branch ? renderNodes(branch.children, roll) : null}
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
