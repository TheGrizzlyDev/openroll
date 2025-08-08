import React, { useState, useEffect } from 'react'
import { renderOml } from '../oml/render'
import { useGameContext } from '../GameContext'
import CodeMirror from '@uiw/react-codemirror'
import { autocompletion } from '@codemirror/autocomplete'
import { EditorView } from '@codemirror/view'
import { omlLanguage, omlCompletion } from '../oml/codemirror'
import { Button } from '../design-system'
import styles from './SmartTextEditor.module.css'

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

  const editorTheme = EditorView.theme({
    '&': {
      backgroundColor: 'var(--color-bg-alt)',
      color: 'var(--color-text)'
    },
    '.cm-content': {
      fontFamily: 'var(--font-body)'
    },
    '.cm-gutters': {
      backgroundColor: 'var(--color-bg-alt)',
      color: 'var(--color-text)'
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--color-text)'
    }
  })

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
    <div className={styles.editor}>
      {editing ? (
        <CodeMirror
          value={draft}
          height="200px"
          extensions={[
            omlLanguage,
            ...(isMobile ? [] : [autocompletion({ override: [omlCompletion] })]),
            editorTheme
          ]}
          onChange={value => setDraft(value)}
        />
      ) : (
        <div>{renderOml(value, roll)}</div>
      )}
      <div className={styles.editorControls}>
        <Button type="button" onClick={handleToggle}>
          {editing ? 'Save' : 'Edit'}
        </Button>
      </div>
    </div>
  )
}
