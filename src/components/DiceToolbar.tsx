import { type RefObject } from 'react'

interface DiceToolbarProps {
  toolbarRef: RefObject<HTMLDivElement | null>
  onThrow: () => void
  onResetView: () => void
  onSetViewMode: (_mode: string) => void
  onToggleSettings: () => void
}

export default function DiceToolbar({
  toolbarRef,
  onThrow,
  onResetView,
  onSetViewMode,
  onToggleSettings,
}: DiceToolbarProps) {
  return (
    <div className="toolbar" ref={toolbarRef}>
      <button id="throw" className="btn" type="button" onClick={onThrow}>
        Throw dice
      </button>
      <button id="reset" className="btn" type="button" onClick={onResetView}>
        Reset view
      </button>
      <label
        className="btn"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        View
        <select
          id="viewMode"
          defaultValue="ortho"
          onChange={(e) => onSetViewMode(e.target.value)}
        >
          <option value="ortho">Ortho (Game)</option>
          <option value="perspTop">Persp Top</option>
          <option value="perspFree">Persp Free</option>
        </select>
      </label>
      <button
        id="toggle-settings"
        className="btn"
        type="button"
        onClick={onToggleSettings}
      >
        Settings
      </button>
    </div>
  )
}

