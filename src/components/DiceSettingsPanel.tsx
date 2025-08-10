import { type ChangeEvent, type RefObject } from 'react'
import { type DiceConfig } from '../hooks/useDiceScene'

interface DiceSettingsPanelProps {
  settingsRef: RefObject<HTMLDivElement | null>
  config: DiceConfig
  handleConfigChange: <K extends keyof DiceConfig>(
    _key: K,
    _parser?: (_value: string) => DiceConfig[K],
  ) => (_e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export default function DiceSettingsPanel({
  settingsRef,
  config,
  handleConfigChange,
}: DiceSettingsPanelProps) {
  return (
    <>
      <div className="panel" id="settings" ref={settingsRef} style={{ display: 'none' }}>
        <div><b>Dice</b></div>
        <div className="grid">
          <label>
            Die
            <input
              id="baseColor"
              type="color"
              value={config.baseColor}
              onChange={handleConfigChange('baseColor')}
            />
          </label>
          <label>
            Emiss
            <input
              id="emissiveColor"
              type="color"
              value={config.emissiveColor}
              onChange={handleConfigChange('emissiveColor')}
            />
          </label>
          <label>
            Emiss Int
            <input
              id="emissiveIntensity"
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={config.emissiveIntensity}
              onChange={handleConfigChange('emissiveIntensity', parseFloat)}
            />
          </label>
          <label>
            Glow
            <input
              id="glowColor"
              type="color"
              value={config.glowColor}
              onChange={handleConfigChange('glowColor')}
            />
          </label>
          <label>
            Glow Opac
            <input
              id="glowOpacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.glowOpacity}
              onChange={handleConfigChange('glowOpacity', parseFloat)}
            />
          </label>
          <label>
            Texture
            <select
              id="textureKind"
              value={config.textureKind}
              onChange={handleConfigChange('textureKind')}
            >
              <option value="none">None</option>
              <option value="checker">Checker</option>
              <option value="stripes">Stripes</option>
              <option value="noise">Noise</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: '8px' }}><b>Nums</b></div>
        <div className="grid">
          <label>
            Font
            <input
              id="fontFamily"
              type="text"
              value={config.fontFamily}
              onChange={handleConfigChange('fontFamily')}
            />
          </label>
          <label>
            Weight
            <input
              id="fontWeight"
              type="text"
              value={config.fontWeight}
              onChange={handleConfigChange('fontWeight')}
            />
          </label>
          <label>
            Size
            <input
              id="fontSize"
              type="text"
              value={config.fontSize}
              onChange={handleConfigChange('fontSize', (v) => parseInt(v, 10) || 0)}
            />
          </label>
          <label>
            Color
            <input
              id="fontColor"
              type="color"
              value={config.fontColor}
              onChange={handleConfigChange('fontColor')}
            />
          </label>
          <label>
            Stroke
            <input
              id="strokeColor"
              type="color"
              value={config.strokeColor}
              onChange={handleConfigChange('strokeColor')}
            />
          </label>
          <label>
            Stroke W
            <input
              id="strokeWidth"
              type="range"
              min="0"
              max="16"
              step="1"
              value={config.strokeWidth}
              onChange={handleConfigChange('strokeWidth', (v) => parseInt(v, 10) || 0)}
            />
          </label>
        </div>
        <div style={{ margin: '10px 0 6px' }}><b>Tray</b></div>
        <div className="grid">
          <label>
            Shape
            <select
              id="trayShape"
              value={config.trayShape}
              onChange={handleConfigChange('trayShape')}
            >
              <option value="hex">Hexagon</option>
              <option value="square">Square</option>
              <option value="oct">Octagon</option>
              <option value="circle">Circle</option>
            </select>
          </label>
          <label>
            Color
            <input
              id="trayBaseColor"
              type="color"
              value={config.trayBaseColor}
              onChange={handleConfigChange('trayBaseColor')}
            />
          </label>
          <label>
            Emiss
            <input
              id="trayEmissiveColor"
              type="color"
              value={config.trayEmissiveColor}
              onChange={handleConfigChange('trayEmissiveColor')}
            />
          </label>
          <label>
            Emiss Int
            <input
              id="trayEmissiveIntensity"
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={config.trayEmissiveIntensity}
              onChange={handleConfigChange('trayEmissiveIntensity', parseFloat)}
            />
          </label>
          <label>
            Opacity
            <input
              id="trayOpacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.trayOpacity}
              onChange={handleConfigChange('trayOpacity', parseFloat)}
            />
          </label>
          <label>
            Texture
            <select
              id="trayTextureKind"
              value={config.trayTextureKind}
              onChange={handleConfigChange('trayTextureKind')}
            >
              <option value="none">None</option>
              <option value="checker">Checker</option>
              <option value="stripes">Stripes</option>
              <option value="noise">Noise</option>
            </select>
          </label>
          <label>
            FloorEps
            <input
              id="floorEps"
              type="range"
              min="0"
              max="0.50"
              step="0.001"
              value={config.floorEps}
              onChange={handleConfigChange('floorEps', parseFloat)}
            />
          </label>
          <label>
            D20 Eps
            <input
              id="floorEpsD20"
              type="range"
              min="0"
              max="0.50"
              step="0.001"
              value={config.floorEpsD20}
              onChange={handleConfigChange('floorEpsD20', parseFloat)}
            />
          </label>
          <label>
            D8 Eps
            <input
              id="floorEpsD8"
              type="range"
              min="0"
              max="0.50"
              step="0.001"
              value={config.floorEpsD8}
              onChange={handleConfigChange('floorEpsD8', parseFloat)}
            />
          </label>
          <label>
            D6 Eps
            <input
              id="floorEpsD6"
              type="range"
              min="0"
              max="0.50"
              step="0.001"
              value={config.floorEpsD6}
              onChange={handleConfigChange('floorEpsD6', parseFloat)}
            />
          </label>
          <label>
            D4 Eps
            <input
              id="floorEpsD4"
              type="range"
              min="0"
              max="0.50"
              step="0.001"
              value={config.floorEpsD4}
              onChange={handleConfigChange('floorEpsD4', parseFloat)}
            />
          </label>
          <label>
            RimH
            <input
              id="trayRimHeight"
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={config.trayRimHeight}
              onChange={handleConfigChange('trayRimHeight', parseFloat)}
            />
          </label>
          <label>
            RimT
            <input
              id="trayRimThickness"
              type="range"
              min="0.05"
              max="1.0"
              step="0.01"
              value={config.trayRimThickness}
              onChange={handleConfigChange('trayRimThickness', parseFloat)}
            />
          </label>
          <label>
            RimCol
            <input
              id="trayRimColor"
              type="color"
              value={config.trayRimColor}
              onChange={handleConfigChange('trayRimColor')}
            />
          </label>
          <label>
            RimEmiss
            <input
              id="trayRimEmissive"
              type="color"
              value={config.trayRimEmissive}
              onChange={handleConfigChange('trayRimEmissive')}
            />
          </label>
          <label>
            RimEmiss Int
            <input
              id="trayRimEmissiveIntensity"
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={config.trayRimEmissiveIntensity}
              onChange={handleConfigChange('trayRimEmissiveIntensity', parseFloat)}
            />
          </label>
          <label>
            Rim Opac
            <input
              id="trayRimOpacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.trayRimOpacity}
              onChange={handleConfigChange('trayRimOpacity', parseFloat)}
            />
          </label>
        </div>
        <div className="small">
          Changes apply <b>live</b>. Set tray opacity to 0 for fully transparent. Rim keeps dice in.
        </div>
      </div>
      <div className="panel hint">
        Top‑down (orthographic). Left‑drag to orbit, wheel to zoom, right‑drag to pan. Click "Throw dice" to re‑roll.
      </div>
    </>
  )
}

