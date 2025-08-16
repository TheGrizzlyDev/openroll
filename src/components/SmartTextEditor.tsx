import React, { useState, useEffect } from 'react'
import { renderOml } from '../oml/render'
import { useGameContext } from '../stores/GameContext'
import CodeMirror from '@uiw/react-codemirror'
import { autocompletion } from '@codemirror/autocomplete'
import {
  omlLanguage,
  omlCompletion,
  omlTheme,
  omlHighlight
} from '../oml/codemirror'
import { Button } from '../design-system'

interface SmartTextEditorProps {
  value: string
  onChange: (_value: string) => void
}

export default function SmartTextEditor({ value, onChange }: SmartTextEditorProps) {
  const { roll } = useGameContext()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Mobi|Android|iP(ad|hone|od)/i.test(navigator.userAgent)

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
    <div className="flex flex-col gap-2">
      {editing ? (
        <CodeMirror
          value={draft}
          height="200px"
          className="w-full"
          extensions={[
            omlLanguage,
            ...(isMobile ? [] : [autocompletion({ override: [omlCompletion] })]),
            omlTheme,
            omlHighlight
          ]}
          onChange={value => setDraft(value)}
        />
      ) : (
        <div>{renderOml(value, roll)}</div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={handleToggle}>
          {editing ? 'Save' : 'Edit'}
        </Button>
      </div>
    </div>
  )
}
