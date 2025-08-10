import { useEffect, useRef, useCallback, type RefObject } from 'react'
import initDiceDemo from '../diceDemo'

export interface DiceConfig {
  baseColor: string
  emissiveColor: string
  emissiveIntensity: number
  glowColor: string
  glowOpacity: number
  textureKind: string
  fontFamily: string
  fontWeight: string
  fontSize: number
  fontColor: string
  strokeColor: string
  strokeWidth: number
  trayShape: string
  trayBaseColor: string
  trayEmissiveColor: string
  trayEmissiveIntensity: number
  trayOpacity: number
  trayTextureKind: string
  floorEps: number
  floorEpsD20: number
  floorEpsD8: number
  floorEpsD6: number
  floorEpsD4: number
  trayRimHeight: number
  trayRimThickness: number
  trayRimColor: string
  trayRimEmissive: string
  trayRimEmissiveIntensity: number
  trayRimOpacity: number
}

interface UseDiceSceneParams {
  app: RefObject<HTMLDivElement | null>
  toast: RefObject<HTMLDivElement | null>
  toolbar: RefObject<HTMLDivElement | null>
  settings: RefObject<HTMLDivElement | null>
  config: DiceConfig
}

export interface DiceSceneApi {
  throwAll: (_seed: number) => void
  toggleSlowMo: () => boolean | undefined
  resetView: () => void
  applyConfig: (_cfg: DiceConfig) => void
  setViewMode: (_mode: string) => void
  rebuildTray: () => void
  toggleSettings: () => void
}

export default function useDiceScene({
  app,
  toast,
  toolbar,
  settings,
  config,
}: UseDiceSceneParams): DiceSceneApi {
  const apiRef = useRef<ReturnType<typeof initDiceDemo> | null>(null)

  useEffect(() => {
    if (app.current && toast.current && toolbar.current && settings.current) {
      apiRef.current = initDiceDemo({
        app: app.current,
        toast: toast.current,
        toolbar: toolbar.current,
        settings: settings.current,
      })
      apiRef.current.applyConfig(config)
    }
    return () => {
      apiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    apiRef.current?.applyConfig(config)
  }, [config])

  const throwAll = useCallback((seed: number) => {
    apiRef.current?.throwAll(seed)
  }, [])

  const toggleSlowMo = useCallback(() => {
    return apiRef.current?.toggleSlowMo()
  }, [])

  const resetView = useCallback(() => {
    apiRef.current?.resetOrbit()
  }, [])

  const applyConfig = useCallback((cfg: DiceConfig) => {
    apiRef.current?.applyConfig(cfg)
  }, [])

  const setViewMode = useCallback((mode: string) => {
    apiRef.current?.setViewMode(mode)
  }, [])

  const rebuildTray = useCallback(() => {
    apiRef.current?.rebuildTray()
  }, [])

  const toggleSettings = useCallback(() => {
    apiRef.current?.toggleSettings()
  }, [])

  return {
    throwAll,
    toggleSlowMo,
    resetView,
    applyConfig,
    setViewMode,
    rebuildTray,
    toggleSettings,
  }
}
