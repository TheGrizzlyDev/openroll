import { useEffect, useRef, useState, useCallback, type ChangeEvent } from 'react'
import useDiceScene, { type DiceConfig } from '../hooks/useDiceScene'
import '../DiceDemo.css'
import DiceCanvas from './DiceCanvas'
import DiceToolbar from './DiceToolbar'
import DiceSettingsPanel from './DiceSettingsPanel'
import DiceToast from './DiceToast'

export default function DiceDemo() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const [slowMo, setSlowMo] = useState(false)
  const [config, setConfig] = useState<DiceConfig>({
    baseColor: '#e991ff',
    emissiveColor: '#3a2bc4',
    emissiveIntensity: 0.28,
    glowColor: '#9a7cff',
    glowOpacity: 0.35,
    textureKind: 'none',
    fontFamily: "'Times New Roman', serif",
    fontWeight: '700',
    fontSize: 68,
    fontColor: '#ffe8b0',
    strokeColor: '#ffb450',
    strokeWidth: 10,
    trayShape: 'hex',
    trayBaseColor: '#1b153d',
    trayEmissiveColor: '#221a55',
    trayEmissiveIntensity: 0.2,
    trayOpacity: 1,
    trayTextureKind: 'none',
    floorEps: 0.2,
    floorEpsD20: 0.2,
    floorEpsD8: 0.2,
    floorEpsD6: 0.2,
    floorEpsD4: 0.2,
    trayRimHeight: 0.8,
    trayRimThickness: 0.3,
    trayRimColor: '#3a2bc4',
    trayRimEmissive: '#7b5cff',
    trayRimEmissiveIntensity: 0.35,
    trayRimOpacity: 0.85,
  })

  const handleConfigChange = <K extends keyof DiceConfig>(
    key: K,
    parser?: (_value: string) => DiceConfig[K],
  ) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = parser
        ? parser(e.target.value)
        : (e.target.value as unknown as DiceConfig[K])
      const newConfig = { ...config, [key]: value }
      setConfig(newConfig)
      applyConfig(newConfig)
    }

  const {
    throwAll,
    toggleSlowMo: toggleSlowMoApi,
    applyConfig,
    resetView,
    setViewMode,
    toggleSettings,
  } = useDiceScene({
    app: canvasRef,
    toast: toastRef,
    toolbar: toolbarRef,
    settings: settingsRef,
    config,
  })

  useEffect(() => {
    throwAll(Date.now())
  }, [throwAll])

  const handleThrow = useCallback(() => {
    throwAll(Date.now())
  }, [throwAll])

  const handleToggleSlowMo = useCallback(() => {
    setSlowMo((prev) => toggleSlowMoApi() ?? prev)
  }, [toggleSlowMoApi])

  return (
    <>
      <DiceCanvas canvasRef={canvasRef} />
      <div id="ui">
        <DiceToast toastRef={toastRef} />
        <DiceToolbar
          toolbarRef={toolbarRef}
          onThrow={handleThrow}
          slowMo={slowMo}
          onToggleSlowMo={handleToggleSlowMo}
          onResetView={resetView}
          onSetViewMode={setViewMode}
          onToggleSettings={toggleSettings}
        />
        <DiceSettingsPanel
          settingsRef={settingsRef}
          config={config}
          handleConfigChange={handleConfigChange}
        />
      </div>
    </>
  )
}

