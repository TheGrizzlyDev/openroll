import React, { useState, useEffect } from 'react'
import { renderOml } from '../oml/render'
import { useGameContext } from '../GameContext'

interface SmartTextEditorProps {
  value: string
  onChange: (_value: string) => void
}

export default function SmartTextEditor({ value, onChange }: SmartTextEditorProps) {
  const { roll } = useGameContext()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  const handleToggle = () => {
    if (editing) {
      onChange(draft)
    }
    setEditing(!editing)
  }

  return (
    <div className="smart-text-editor">
      {editing ? (
        <textarea value={draft} onChange={e => setDraft(e.target.value)} />
      ) : (
        <div>{renderOml(value, roll)}</div>
      )}
      <div className="editor-controls">
        <button type="button" onClick={handleToggle}>
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  )
}
