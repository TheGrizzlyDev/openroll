import { useEffect, useCallback } from 'react'
import SmartTextEditor from './SmartTextEditor'
import { useGameContext } from '../stores/GameContext'

export default function Notes() {
  const {
    state: { sheet },
    dispatch
  } = useGameContext()

  const updateNotes = useCallback(
    (value: string) =>
      dispatch({ type: 'SET_SHEET', sheet: { ...sheet, notes: value } }),
    [dispatch, sheet]
  )

  useEffect(() => {
    const stored = localStorage.getItem('presets')
    if (!stored) return
    try {
      const presets = JSON.parse(stored) as Array<{ notation: string }>
      if (Array.isArray(presets) && presets.length) {
        const lines = presets
          .map(p => `[dice "${p.notation}" ${p.notation}]`)
          .join('\\n')
        const newNotes = sheet.notes ? `${sheet.notes}\\n${lines}` : lines
        updateNotes(newNotes)
      }
    } catch {
      // ignore malformed presets
    }
    localStorage.removeItem('presets')
  }, [sheet, updateNotes])

  return (
    <div className="notes">
      <h2>Notes</h2>
      <SmartTextEditor value={sheet.notes} onChange={updateNotes} />
    </div>
  )
}
