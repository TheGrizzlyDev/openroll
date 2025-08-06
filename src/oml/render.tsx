/* eslint react-refresh/only-export-components: off, react-hooks/rules-of-hooks: off */
import { useGameContext } from '../GameContext'
import { parseOml, type OmlNode } from './parser'
import React from 'react'

function renderNodes(nodes: OmlNode[], roll: (_notation: string) => unknown) {
  return nodes.map((node, i) => {
    if (node.type === 'dice') {
      return (
        <button
          type="button"
          key={i}
          className="badge"
          onClick={() => roll(node.notation)}
        >
          {node.notation}
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
    return <span key={i}>{node.text}</span>
  })
}

export function renderOml(text: string, rollFn?: (_notation: string) => unknown) {
  const doRoll = rollFn ?? useGameContext().roll
  const nodes = parseOml(text)
  return <>{renderNodes(nodes, doRoll)}</>
}

export { parseOml, type OmlNode } from './parser'
