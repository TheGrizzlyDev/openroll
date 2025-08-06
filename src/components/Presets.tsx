import { useEffect, useState, type ChangeEvent } from 'react'
import { Parser } from '@dice-roller/rpg-dice-roller'
import { useGameContext } from '../GameContext'
import { Input } from '../ui/Input'
import { Button } from '../ui'

interface Preset {
  id: number
  notation: string
  error?: string
}

export default function Presets() {
  const { roll } = useGameContext()
  const [presets, setPresets] = useState<Preset[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('presets')
    if (stored) {
      try {
        setPresets(JSON.parse(stored) as Preset[])
        return
      } catch {
        // ignore invalid stored data
      }
    }
    setPresets([
      { id: 1, notation: '1d4' },
      { id: 2, notation: '1d6' },
      { id: 3, notation: '1d8' },
      { id: 4, notation: '1d10' },
      { id: 5, notation: '1d12' },
      { id: 6, notation: '1d20' }
    ])
  }, [])

  useEffect(() => {
    localStorage.setItem('presets', JSON.stringify(presets))
  }, [presets])

  const updatePreset = (id: number, notation: string) => {
    setPresets(prev => prev.map(p => (p.id === id ? { ...p, notation, error: '' } : p)))
  }

  const updateError = (id: number, error: string) => {
    setPresets(prev => prev.map(p => (p.id === id ? { ...p, error } : p)))
  }

  const handleRoll = (preset: Preset) => {
    try {
      Parser.parse(preset.notation)
      roll(preset.notation, preset.notation)
      updateError(preset.id, '')
    } catch {
      updateError(preset.id, 'Invalid notation')
    }
  }

  const addPreset = () => {
    const nextId = presets.length ? Math.max(...presets.map(p => p.id)) + 1 : 1
    setPresets([...presets, { id: nextId, notation: '' }])
  }

  const removePreset = (id: number) => {
    setPresets(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="presets">
      <h2>Presets</h2>
      <ul>
        {presets.map(preset => (
          <li key={preset.id}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                value={preset.notation}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updatePreset(preset.id, e.target.value)}
                placeholder="1d20"
                className={preset.error ? 'error' : undefined}
              />
            </div>
            <div className="preset-buttons">
              <Button onClick={() => handleRoll(preset)}>Roll</Button>
              <Button onClick={() => removePreset(preset.id)}>Remove</Button>
            </div>
            {preset.error && <span className="error-message">{preset.error}</span>}
          </li>
        ))}
      </ul>
      <Button onClick={addPreset}>Add preset</Button>
    </div>
  )
}
