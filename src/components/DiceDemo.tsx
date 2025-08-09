import { useEffect } from 'react'
import initDiceDemo from '../diceDemo'
import '../DiceDemo.css'

export default function DiceDemo() {
  useEffect(() => {
    const app = document.getElementById('app') as HTMLElement
    const toast = document.getElementById('toast') as HTMLElement
    const toolbar = document.querySelector('.toolbar') as HTMLElement
    const settings = document.getElementById('settings') as HTMLElement
    initDiceDemo({ app, toast, toolbar, settings })
  }, [])

  return (
    <>
      <div id="app" />
      <div id="ui">
        <div id="toast" />
        <div className="toolbar">
          <button id="throw" className="btn">Throw dice</button>
          <button id="slowmo" className="btn">Slow‑mo: off</button>
          <button id="reset" className="btn">Reset view</button>
          <label className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            View
            <select id="viewMode" defaultValue="ortho">
              <option value="ortho">Ortho (Game)</option>
              <option value="perspTop">Persp Top</option>
              <option value="perspFree">Persp Free</option>
            </select>
          </label>
          <button id="toggle-settings" className="btn">Settings</button>
        </div>
        <div className="panel" id="settings" style={{ display: 'none' }}>
          <div><b>Dice</b></div>
          <div className="grid">
            <label>Die <input id="baseColor" type="color" defaultValue="#e991ff" /></label>
            <label>Emiss <input id="emissiveColor" type="color" defaultValue="#3a2bc4" /></label>
            <label>Emiss Int <input id="emissiveIntensity" type="range" min="0" max="2" step="0.01" defaultValue="0.28" /></label>
            <label>Glow <input id="glowColor" type="color" defaultValue="#9a7cff" /></label>
            <label>Glow Opac <input id="glowOpacity" type="range" min="0" max="1" step="0.01" defaultValue="0.35" /></label>
            <label>
              Texture
              <select id="textureKind" defaultValue="none">
                <option value="none">None</option>
                <option value="checker">Checker</option>
                <option value="stripes">Stripes</option>
                <option value="noise">Noise</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: '8px' }}><b>Nums</b></div>
          <div className="grid">
            <label>Font <input id="fontFamily" type="text" defaultValue="'Times New Roman', serif" /></label>
            <label>Weight <input id="fontWeight" type="text" defaultValue="700" /></label>
            <label>Size <input id="fontSize" type="text" defaultValue="68" /></label>
            <label>Color <input id="fontColor" type="color" defaultValue="#ffe8b0" /></label>
            <label>Stroke <input id="strokeColor" type="color" defaultValue="#ffb450" /></label>
            <label>Stroke W <input id="strokeWidth" type="range" min="0" max="16" step="1" defaultValue="10" /></label>
          </div>
          <div style={{ margin: '10px 0 6px' }}><b>Tray</b></div>
          <div className="grid">
            <label>
              Shape
              <select id="trayShape" defaultValue="hex">
                <option value="hex">Hexagon</option>
                <option value="square">Square</option>
                <option value="oct">Octagon</option>
                <option value="circle">Circle</option>
              </select>
            </label>
            <label>Color <input id="trayBaseColor" type="color" defaultValue="#1b153d" /></label>
            <label>Emiss <input id="trayEmissiveColor" type="color" defaultValue="#221a55" /></label>
            <label>Emiss Int <input id="trayEmissiveIntensity" type="range" min="0" max="2" step="0.01" defaultValue="0.2" /></label>
            <label>Opacity <input id="trayOpacity" type="range" min="0" max="1" step="0.01" defaultValue="1" /></label>
            <label>
              Texture
              <select id="trayTextureKind" defaultValue="none">
                <option value="none">None</option>
                <option value="checker">Checker</option>
                <option value="stripes">Stripes</option>
                <option value="noise">Noise</option>
              </select>
            </label>
            <label>FloorEps <input id="floorEps" type="range" min="0" max="0.50" step="0.001" defaultValue="0.200" /></label>
            <label>D20 Eps <input id="floorEpsD20" type="range" min="0" max="0.50" step="0.001" defaultValue="0.200" /></label>
            <label>D8 Eps <input id="floorEpsD8" type="range" min="0" max="0.50" step="0.001" defaultValue="0.200" /></label>
            <label>D6 Eps <input id="floorEpsD6" type="range" min="0" max="0.50" step="0.001" defaultValue="0.200" /></label>
            <label>D4 Eps <input id="floorEpsD4" type="range" min="0" max="0.50" step="0.001" defaultValue="0.200" /></label>
            <label>RimH <input id="trayRimHeight" type="range" min="0" max="2" step="0.01" defaultValue="0.8" /></label>
            <label>RimT <input id="trayRimThickness" type="range" min="0.05" max="1.0" step="0.01" defaultValue="0.3" /></label>
            <label>RimCol <input id="trayRimColor" type="color" defaultValue="#3a2bc4" /></label>
            <label>RimEmiss <input id="trayRimEmissive" type="color" defaultValue="#7b5cff" /></label>
            <label>RimEmiss Int <input id="trayRimEmissiveIntensity" type="range" min="0" max="2" step="0.01" defaultValue="0.35" /></label>
            <label>Rim Opac <input id="trayRimOpacity" type="range" min="0" max="1" step="0.01" defaultValue="0.85" /></label>
          </div>
          <div className="small">Changes apply <b>live</b>. Set tray opacity to 0 for fully transparent. Rim keeps dice in.</div>
        </div>
        <div className="panel hint">
          Top‑down (orthographic). Left‑drag to orbit, wheel to zoom, right‑drag to pan. Click "Throw dice" to re‑roll.
        </div>
      </div>
    </>
  )
}
