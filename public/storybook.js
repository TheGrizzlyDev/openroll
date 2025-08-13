import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

/**
 * TTRPG Primitives — Full Library (Generic + optional drag-and-drop)
 * with a dependency-free "Mini Storybook" for browsing demos.
 * -----------------------------------------------------------------
 * - No game rules, no external deps.
 * - Drag-and-drop is opt-in on layout containers.
 * - Token/Tracker primitives are generic and mobile-first.
 */

// ----------------------
// Design tokens (CSS)
// ----------------------
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg: #0f1115;
      --surface: #141820;
      --surface-2: #1a1f29;
      --surface-3: #222938;
      --text: #e8ecf1;
      --muted: #98a2b3;
      --accent: #87f39a;
      --temp: #7dd3fc;
      --danger: #f87171;
      --radius: 12px;
      --border: 1px solid rgba(255,255,255,0.08);
      --gap-xs: 6px; --gap-sm: 10px; --gap-md: 16px; --gap-lg: 24px;
      --control-h: 40px;
      --control-sz: 36px;
    }
    html, body, #root { height: 100%; }
    body { margin:0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
    .container { width: min(1100px, 100% - 32px); margin: 0 auto; padding: var(--gap-lg) 0; display: grid; gap: var(--gap-lg); }
    .card { background: var(--surface); border: var(--border); border-radius: var(--radius); padding: var(--gap-md); }
    .card-title { font-weight: 800; letter-spacing: -0.01em; }
    .subtle { color: var(--muted); }
    .btn { height: var(--control-h); padding: 0 12px; border-radius: 10px; border: var(--border); background: var(--surface-2); color: var(--text); cursor: pointer; }
    .btn:hover { background: #202634; }
    .btn.ghost:hover{ background:#2a3245; }
    .btn.ghost { background: var(--surface-3); border-color: rgba(255,255,255,0.18); }

    /* Icon / square buttons */
    .btn.icon { width: var(--control-sz); height: var(--control-sz); padding: 0; display:inline-flex; align-items:center; justify-content:center; }

    .row { display:flex; align-items:center; justify-content:space-between; gap: var(--gap-sm); }

    /* DnD state helpers */
    [data-dragging] { outline: 2px dashed var(--accent); outline-offset: 2px; opacity: .9; }
    [data-drop-target] { box-shadow: 0 0 0 2px rgba(135,243,154,.35) inset; }

    /* Collapsible */
    .collapsible-trigger { width: 100%; text-align:left; background: var(--surface-2); border: var(--border); border-radius: 10px; height: var(--control-h); padding: 0 12px; }
    .collapsible-content { overflow: hidden; transition: grid-template-rows .18s ease; display: grid; grid-template-rows: 0fr; }
    .collapsible-content[data-open='true'] { grid-template-rows: 1fr; }
    .collapsible-inner { min-height: 0; }
  `}</style>
)

// ----------------------
// Helpers
// ----------------------
export function reorderById(list, activeId, destinationIndex){
  const idx = list.findIndex(x => x.id === activeId)
  if (idx < 0 || destinationIndex == null || destinationIndex < 0 || destinationIndex >= list.length) return list
  const copy = list.slice()
  const [item] = copy.splice(idx, 1)
  copy.splice(destinationIndex, 0, item)
  return copy
}

function useStableCallback(fn){
  const ref = useRef(fn)
  useLayoutEffect(()=>{ ref.current = fn }, [fn])
  return useCallback((...args)=>ref.current?.(...args), [])
}

// Compute closest index by element center to a given point
function closestIndexByCenter(containerEl, selector, point){
  const els = Array.from(containerEl.querySelectorAll(selector))
  let min = Infinity, best = -1
  els.forEach((el, i) => {
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width/2
    const cy = r.top + r.height/2
    const dx = point.x - cx, dy = point.y - cy
    const dist = dx*dx + dy*dy
    if (dist < min){ min = dist; best = i }
  })
  return best
}

// Exposed helper for tests & components
export function nextCheckState(_triState, current){
  const c = current || 'off'
  return c === 'on' ? 'off' : 'on'
}

// Compute resource fill portions for base and temp HP
export function computeResourceFill(value, max, temp){
  const m = Math.max(1, Number(max) || 1)
  const base = Math.max(0, Math.min(Number(value)||0, m))
  const tempExtra = Math.max(0, Math.min(Number(temp)||0, m - base))
  const basePct = base / m
  const tempExtraPct = tempExtra / m
  const cappedFillPct = (base + tempExtra) / m
  return { base, tempExtra, basePct, tempExtraPct, cappedFillPct }
}

// ----------------------
// Internal drag-and-drop hook
// ----------------------
function useInternalDragAndDrop({
  enabled,
  items,
  axis = 'y',
  longPressMs = 300,
  onStart,
  onUpdate,
  onEnd,
  canDrop,
}){
  const containerRef = useRef(null)
  const [activeId, setActiveId] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [sourceIndex, setSourceIndex] = useState(null)
  const [keyboardMode, setKeyboardMode] = useState(false)
  const longPressTimer = useRef(null)

  // Cleanup timer
  useEffect(()=>()=>{ if(longPressTimer.current) clearTimeout(longPressTimer.current) }, [])

  const endDrag = useStableCallback((cancelled=false)=>{
    if (!enabled) return
    const destIndex = overIndex
    const id = activeId
    setActiveId(null); setOverIndex(null); setSourceIndex(null); setKeyboardMode(false)
    onEnd?.({ activeId: id, sourceIndex, overId: items[destIndex]?.id, destinationIndex: destIndex, position: 'before', cancelled })
  })

  const startPointerDrag = useStableCallback((id, index)=>{
    setActiveId(id); setSourceIndex(index)
    onStart?.(id)
    const move = (e)=>{
      const point = { x: e.clientX ?? e.touches?.[0]?.clientX, y: e.clientY ?? e.touches?.[0]?.clientY }
      const dest = closestIndexByCenter(containerRef.current, '[data-dnd-item]', point)
      if (dest !== -1 && dest !== overIndex){
        if (!canDrop || canDrop(id, items[dest]?.id)){
          setOverIndex(dest)
          onUpdate?.(id, items[dest]?.id, 'before')
        }
      }
      e.preventDefault()
    }
    const up = ()=>{
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
      endDrag(false)
    }
    window.addEventListener('pointermove', move, { passive:false })
    window.addEventListener('pointerup', up)
    window.addEventListener('touchmove', move, { passive:false })
    window.addEventListener('touchend', up)
  })

  const getItemDnDHandlers = useCallback((item, index)=>{
    if (!enabled){
      return { attributes: {}, listeners: {}, handleProps: {}, isDragging:false, isDropTarget:false }
    }
    const id = item.id
    const listeners = {
      onKeyDown: (e)=>{
        if (e.key === ' ' || e.key === 'Spacebar'){
          e.preventDefault()
          if (activeId == null){
            // pick up
            setKeyboardMode(true)
            setActiveId(id)
            setSourceIndex(index)
            setOverIndex(index)
            onStart?.(id)
          } else {
            // drop
            endDrag(false)
          }
        } else if (keyboardMode && activeId){
          if (e.key === 'Escape') { e.preventDefault(); endDrag(true) }
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight'){
            e.preventDefault(); setOverIndex(prev => Math.min((prev ?? index)+1, items.length-1))
          }
          if (e.key === 'ArrowUp' || e.key === 'ArrowLeft'){
            e.preventDefault(); setOverIndex(prev => Math.max((prev ?? index)-1, 0))
          }
        }
      },
      tabIndex: 0,
      role: 'listitem',
      'aria-grabbed': activeId === id ? 'true' : 'false',
    }

    const handleProps = {
      onPointerDown: (e)=>{
        if (e.button !== 0) return
        const start = ()=> startPointerDrag(id, index)
        if (e.pointerType === 'touch'){
          longPressTimer.current = setTimeout(start, longPressMs)
          const cancel = ()=>{ if(longPressTimer.current){ clearTimeout(longPressTimer.current); longPressTimer.current = null } }
          const clearAll = ()=>{ cancel(); window.removeEventListener('pointerup', clearAll); window.removeEventListener('pointermove', cancel) }
          window.addEventListener('pointerup', clearAll)
          window.addEventListener('pointermove', cancel, { passive:true })
        } else {
          start()
        }
      },
    }

    const isDragging = activeId === id
    const isDropTarget = overIndex === index && activeId != null && !isDragging

    return { attributes: listeners, listeners, handleProps, isDragging, isDropTarget }
  }, [enabled, activeId, overIndex, items.length, longPressMs, keyboardMode, onStart, endDrag, startPointerDrag])

  return { containerRef, activeId, overIndex, sourceIndex, getItemDnDHandlers }
}

// ----------------------
// Containers
// ----------------------
function BaseReorderContainer({
  as: As='div',
  className,
  style,
  items,
  renderItem,
  dragAndDropEnabled = false,
  dragAndDropAxis,
  dragAndDropLongPressMs,
  onDragAndDropStart,
  onDragAndDropUpdate,
  onDragAndDropEnd,
  dragAndDropCanDrop,
  role,
}){
  const { containerRef, getItemDnDHandlers } = useInternalDragAndDrop({
    enabled: dragAndDropEnabled,
    items,
    axis: dragAndDropAxis,
    longPressMs: dragAndDropLongPressMs ?? 300,
    onStart: onDragAndDropStart,
    onUpdate: onDragAndDropUpdate,
    onEnd: onDragAndDropEnd,
    canDrop: dragAndDropCanDrop,
  })

  return (
    <As ref={containerRef} className={className} style={style} role={role || 'list'}>
      {items.map((item, index) => {
        const dnd = getItemDnDHandlers(item, index)
        return (
          <div key={item.id} data-dnd-item data-dragging={dnd.isDragging || undefined} data-drop-target={dnd.isDropTarget || undefined}>
            {renderItem(item, dnd)}
          </div>
        )}
      )}
    </As>
  )
}

export function Stack(props){
  return (
    <BaseReorderContainer
      {...props}
      className={props.className || ''}
      style={{ display:'grid', gap:'var(--gap-sm)', ...(props.style||{}) }}
    />
  )
}

export function Cluster(props){
  return (
    <BaseReorderContainer
      {...props}
      className={props.className || ''}
      style={{ display:'flex', flexWrap:'wrap', gap:'var(--gap-sm)', alignItems:'flex-start', ...(props.style||{}) }}
    />
  )
}

export function Grid(props){
  const { cols = { base:1, md:2, lg:3 } } = props
  const gridTemplate = useMemo(()=>{
    if (typeof cols === 'number') return `repeat(${cols}, minmax(0,1fr))`
    return `repeat(${cols.base||1}, minmax(0,1fr))`
  }, [cols])
  return (
    <BaseReorderContainer
      {...props}
      className={props.className || ''}
      style={{ display:'grid', gridTemplateColumns: gridTemplate, gap:'var(--gap-md)', ...(props.style||{}) }}
    />
  )
}

export function ResponsiveList({ mode='auto', columns=[], items, renderItem, ...rest }){
  const [isMobile, setIsMobile] = useState(false)
  useEffect(()=>{
    const m = window.matchMedia('(max-width: 900px)')
    const on = () => setIsMobile(m.matches)
    on();
    m.addEventListener('change', on)
    return ()=> m.removeEventListener('change', on)
  }, [])

  if (mode === 'cards' || (mode==='auto' && isMobile)){
    return (
      <Grid {...rest} items={items} renderItem={renderItem} />
    )
  }

  // Simple table layout for desktop
  return (
    <div className={rest.className} style={{ ...(rest.style||{}), overflowX:'auto' }} role="table">
      <div role="row" style={{ display:'grid', gridTemplateColumns:`repeat(${columns.length}, minmax(120px, 1fr))`, gap:'var(--gap-sm)', padding:'8px 6px', color:'var(--muted)' }}>
        {columns.map(col => <div key={col.id} role="columnheader">{col.header}</div>)}
      </div>
      <Stack
        {...rest}
        items={items}
        renderItem={(item, ctx)=> (
          <div role="row" style={{ display:'grid', gridTemplateColumns:`repeat(${columns.length}, minmax(120px, 1fr))`, gap:'var(--gap-sm)', padding:'8px 6px', borderRadius:'8px', background:'var(--surface)' }} {...ctx.attributes}>
            {columns.map(col => <div key={col.id} role="cell">{col.renderCell ? col.renderCell(item) : renderItem(item, ctx)}</div>)}
          </div>
        )}
      />
    </div>
  )
}

// ----------------------
// Small UI helpers
// ----------------------
export const Button = (p)=> <button className={`btn ${p.variant||''}`} {...p} />
export const Card = ({ title, subtitle, actions, children, ...rest }) => (
  <div className="card" {...rest}>
    {(title || subtitle || actions) && (
      <div className="row" style={{ marginBottom: 8 }}>
        <div>
          {title && <div className="card-title">{title}</div>}
          {subtitle && <div className="subtle" style={{ marginTop: 4 }}>{subtitle}</div>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </div>
)
export const Container = ({ children }) => (<div className="container">{children}</div>)

export function Collapsible({ title, defaultOpen=false, children, actions }){
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="card">
      <button className="collapsible-trigger" aria-expanded={open} onClick={()=> setOpen(o=>!o)}>
        <span style={{ fontWeight:700 }}>{title}</span>
        <span style={{ float:'right' }}>{open ? '▴' : '▾'}</span>
      </button>
      <div className="collapsible-content" data-open={open}>
        <div className="collapsible-inner" style={{ paddingTop:10 }}>{children}</div>
      </div>
      {actions && <div style={{ marginTop:10 }}>{actions}</div>}
    </div>
  )
}

// ----------------------
// Token / Tracker primitives (generic)
// ----------------------
export function ProgressTrack({
  value,
  max,
  onChange,
  label,
  segments,
  variant='pips',
  density='cozy',
  readOnly,
  getPipContent, // (index:number, filled:boolean) => ReactNode (optional)
}){
  const size = density==='compact'? 28 : density==='comfortable'? 36 : 32
  const handleClick = (i)=>{ if(!readOnly) onChange?.(i+1) }
  if (variant === 'bar'){
    const pct = Math.max(0, Math.min(1, (value||0)/Math.max(1,max)))
    return (
      <div aria-label={label} className="card" style={{ padding:8 }}>
        {label && <div className="subtle" style={{ fontSize:12, marginBottom:6 }}>{label}</div>}
        <div style={{ height: size/3, background:'var(--surface-2)', border:'var(--border)', borderRadius:999, overflow:'hidden', position:'relative' }}>
          <div style={{ width:`${pct*100}%`, height:'100%', background:'var(--accent)', transition:'width .15s' }} />
        </div>
      </div>
    )
  }
  const groups = segments && segments.length ? segments : [max]
  let pipIndex = 0
  return (
    <div aria-label={label} className="card" style={{ padding:8 }}>
      {label && <div className="subtle" style={{ fontSize:12, marginBottom:6 }}>{label}</div>}
      <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        {groups.map((g, gi)=> (
          <div key={gi} style={{ display:'flex', gap:6 }}>
            {Array.from({length:g}).map((_,i)=>{
              const filled = pipIndex < value
              const idx = pipIndex; pipIndex++
              return (
                <button key={i} className="pip" aria-pressed={filled}
                  onClick={()=>handleClick(idx)} disabled={readOnly}
                  style={{ width:size, height:size, borderRadius:8, border:'var(--border)', background: filled? 'var(--accent)' : 'var(--surface-2)', color: filled? '#0b0f14':'var(--text)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
                  {getPipContent ? getPipContent(idx, filled) : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}



export function ClockTrack({ value, max, size=100, onChange, direction='cw' }){
  const r = (size/2) - 6
  const stroke = 10
  const circumference = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, (value||0)/Math.max(1,max)))
  const dash = pct * circumference
  const gap = circumference - dash
  const startRotation = -90
  return (
    <div className="card" style={{ padding:8, display:'inline-flex' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(${startRotation} ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r}
                  stroke="var(--accent)" strokeWidth={stroke} fill="none"
                  strokeDasharray={`${dash} ${gap}`} strokeLinecap="butt"
                  transform={direction==='ccw'?`scale(-1,1) translate(${-size},0)`:undefined}
          />
          {Array.from({length:max}).map((_,i)=>{
            const angle = (i/max) * 360
            const rad = (Math.PI/180)*(angle)
            const x1 = size/2 + (r+stroke/2) * Math.cos(rad)
            const y1 = size/2 + (r+stroke/2) * Math.sin(rad)
            const x2 = size/2 + (r-stroke/2) * Math.cos(rad)
            const y2 = size/2 + (r-stroke/2) * Math.sin(rad)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          })}
        </g>
      </svg>
      <div style={{ marginLeft:12 }}>
        <div className="subtle" style={{ fontSize:12, marginBottom:6 }}>Clock</div>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="icon" onClick={()=> onChange?.(Math.max(0, (value||0)-1))}>-1</Button>
          <Button variant="icon" onClick={()=> onChange?.(Math.min(max, (value||0)+1))}>+1</Button>
        </div>
      </div>
    </div>
  )
}

// Gauge with base + temp overlay (temp adds to current, not max)
export function Gauge({ value, max=100, temp=0, thresholds=[], label }){
  const { basePct, tempExtraPct } = computeResourceFill(value, max, temp)
  return (
    <div className="card" style={{ padding:8 }}>
      {label && <div className="subtle" style={{ fontSize:12, marginBottom:6 }}>{label}</div>}
      <div style={{ position:'relative', height:12, borderRadius:999, background:'var(--surface-2)', border:'var(--border)' }}>
        {/* base HP */}
        <div style={{ position:'absolute', inset:0, width:`${basePct*100}%`, background:'var(--accent)', borderRadius:999 }} />
        {/* temp overlay (only the extra portion beyond base) */}
        {tempExtraPct>0 && (
          <div style={{ position:'absolute', left:`${basePct*100}%`, top:0, bottom:0, width:`${tempExtraPct*100}%`, background:'var(--temp)', borderTopRightRadius:999, borderBottomRightRadius:999 }} />
        )}
        {thresholds.map((t,i)=>{
          const x = Math.max(0, Math.min(100, ((t.value||0)/Math.max(1,max))*100))
          return <div key={i} style={{ position:'absolute', left:`${x}%`, top:-4, bottom:-4, width:2, background:t.color||'rgba(255,255,255,.35)' }} />
        })}
      </div>
    </div>
  )
}

// Counter now supports optional extra actions and long-press to change step
export function Counter({ value, min=0, max=9999, step=1, onChange, label, actions }){
  const [localStep, setLocalStep] = useState(step)
  useEffect(()=> setLocalStep(step), [step])
  const clamp = (n)=> Math.max(min, Math.min(max, n))
  const set = (n)=> onChange?.(clamp(n))

  const lpTimer = useRef(null)
  const askStep = ()=>{
    const s = window.prompt('Change by how much?', String(localStep))
    if (s!=null){ const n = parseInt(s,10); if(!Number.isNaN(n) && n>0) setLocalStep(n) }
  }
  const onMinusDown = ()=>{ lpTimer.current = setTimeout(askStep, 450) }
  const onPlusDown = ()=>{ lpTimer.current = setTimeout(askStep, 450) }
  const clearLp = ()=>{ if(lpTimer.current){ clearTimeout(lpTimer.current); lpTimer.current=null } }

  return (
    <div className="card" style={{ display:'grid', gap:8 }}>
      {label && <div className="subtle" style={{ fontSize:12 }}>{label} </div>}
      <div className="row" style={{ gap:6, flexWrap:'wrap' }}>
        <Button variant="icon" onPointerDown={onMinusDown} onPointerUp={clearLp} onPointerLeave={clearLp} onClick={()=> set((value||0)-localStep)}>-</Button>
        <input value={value} onChange={(e)=> set(Number(e.target.value)||0)} style={{ width:96, textAlign:'center', height:36, border:'var(--border)', borderRadius:8, background:'var(--surface-2)', color:'var(--text)' }} />
        <Button variant="icon" onPointerDown={onPlusDown} onPointerUp={clearLp} onPointerLeave={clearLp} onClick={()=> set((value||0)+localStep)}>+</Button>
        {actions && <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{actions}</div>}
      </div>
    </div>
  )
}

// ResourcePanel — compact & responsive with temp shown in bar
export function ResourcePanel({ label='Resource', value, max, temp=0, step=1, onChange }){
  const clamp = (v, m)=> Math.max(0, Math.min(v, m))
  const set = (patch)=>{
    const next = { value, max, temp, ...patch }
    next.max = Math.max(1, next.max)
    next.value = clamp(next.value, next.max)
    next.temp = Math.max(0, next.temp||0)
    onChange?.(next)
  }
  return (
    <div className="card" style={{ display:'grid', gap:10 }}>
      <div className="row"><div className="card-title">{label}</div></div>
      <Gauge value={value} max={max} temp={temp} />
      <div style={{ display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Counter label="Current" value={value} min={0} max={max} step={step} onChange={(n)=> set({ value:n })} />
        <Counter label="Max" value={max} min={1} step={step} onChange={(n)=> set({ max:n })} />
        <Counter label="Temp" value={temp} min={0} step={step} onChange={(n)=> set({ temp:n })} />
      </div>
    </div>
  )
}

// ----------------------
// CheckList primitive (binary / tri-state)
// ----------------------
export function CheckList({ items, onChange, label }){
  const toggle = (i)=>{
    const next = items.map((it, idx)=> idx===i ? { ...it, state: nextCheckState(false, it.state) } : it)
    onChange?.(next)
  }
  return (
    <div className="card" style={{ display:'grid', gap:8 }}>
      {label && <div className="subtle" style={{ fontSize:12 }}>{label}</div>}
      <div style={{ display:'grid', gap:8 }}>
        {items.map((it, i)=> (
          <button key={it.id||i} onClick={()=>toggle(i)} className="row" style={{ justifyContent:'flex-start', padding:8, border:'var(--border)', borderRadius:8, background:'var(--surface-2)' }}>
            <span style={{ width:18, height:18, borderRadius:4, border:'var(--border)', marginRight:8, background: it.state==='on'? 'var(--accent)' : 'transparent' }} />
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ----------------------
// Mini Storybook shell (no deps) + stories
// ----------------------

function StoryLayout({ title, description, children, controls }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:16 }}>
      <div className="card" style={{ position:'sticky', top:16, alignSelf:'start' }}>
        <div className="card-title" style={{ marginBottom:6 }}>{title}</div>
        {description && <div className="subtle" style={{ fontSize:13 }}>{description}</div>}
        {controls}
      </div>
      <div className="card" style={{ minHeight:200 }}>{children}</div>
    </div>
  )
}

// Individual stories (each returns JSX)
const Stories = {
  'stack-drag-and-drop': {
    name: 'Stack (drag-and-drop)',
    render: function StackStory(){
      const [items, setItems] = useState([
        { id:'c1', label:'Objective A', state:'off' },
        { id:'c2', label:'Objective B', state:'on' },
        { id:'c3', label:'Objective C', state:'off' },
      ])
      return (
        <StoryLayout title="Stack" description="Vertical list with optional drag-and-drop, keyboard & touch.">
          <Stack
            dragAndDropEnabled
            items={items}
            onDragAndDropEnd={({ activeId, destinationIndex }) => {
              if (destinationIndex == null) return
              setItems(prev => reorderById(prev, activeId, destinationIndex))
            }}
            renderItem={(item, ctx)=> (
              <Card data-dragging={ctx.isDragging || undefined} actions={<Button aria-label="Drag" {...ctx.handleProps}>≡</Button>}>
                <div className="card-title">{item.title}</div>
                <div className="subtle">{item.body}</div>
              </Card>
            )}
          />
        </StoryLayout>
      )
    }
  },
  'cluster-drag-and-drop': {
    name: 'Cluster (drag-and-drop)',
    render: function ClusterStory(){
      const [chips, setChips] = useState([
        { id:'x', title:'Fire' },{ id:'y', title:'Water' },{ id:'z', title:'Stone' },{ id:'w', title:'Wind' },
      ])
      return (
        <StoryLayout title="Cluster" description="Horizontal row that wraps. Great for chips/tokens.">
          <Cluster
            dragAndDropEnabled
            items={chips}
            onDragAndDropEnd={({ activeId, destinationIndex }) => {
              if (destinationIndex == null) return
              setChips(prev => reorderById(prev, activeId, destinationIndex))
            }}
            renderItem={(chip, ctx)=> (
              <span {...ctx.attributes} className="card" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius: 9999 }} data-dragging={ctx.isDragging || undefined}>
                <Button aria-label="Drag chip" {...ctx.handleProps}>≡</Button>
                {chip.title}
              </span>
            )}
          />
        </StoryLayout>
      )
    }
  },
  'grid-drag-and-drop': {
    name: 'Grid (drag-and-drop)',
    render: function GridStory(){
      const [cards, setCards] = useState([
        { id:'1', title:'Card 1', body:'Drag me around' },
        { id:'2', title:'Card 2', body:'Reorder in grid' },
        { id:'3', title:'Card 3', body:'Keyboard supported' },
        { id:'4', title:'Card 4', body:'Long-press on touch' },
      ])
      return (
        <StoryLayout title="Grid" description="Responsive card grid with drag-and-drop.">
          <Grid
            cols={{ base:1, md:2, lg:3 }}
            dragAndDropEnabled
            items={cards}
            onDragAndDropEnd={({ activeId, destinationIndex }) => {
              if (destinationIndex == null) return
              setCards(prev => reorderById(prev, activeId, destinationIndex))
            }}
            renderItem={(card, ctx)=> (
              <Card data-dragging={ctx.isDragging || undefined} actions={<Button aria-label="Drag" {...ctx.handleProps}>≡</Button>}>
                <div className="card-title">{card.title}</div>
                <div className="subtle">{card.body}</div>
              </Card>
            )}
          />
        </StoryLayout>
      )
    }
  },
  'responsive-list': {
    name: 'ResponsiveList (table↔cards)',
    render: function ListStory(){
      const [rows, setRows] = useState([
        { id:'r1', title:'Shortsword', body:'1d6 piercing' },
        { id:'r2', title:'Bow', body:'1d6 piercing, ranged' },
        { id:'r3', title:'Torch', body:'improvised, light' },
      ])
      return (
        <StoryLayout title="ResponsiveList" description="Table on desktop; cards on mobile; drag-and-drop in both.">
          <ResponsiveList
            dragAndDropEnabled
            mode="auto"
            columns={[{ id:'name', header:'Name', renderCell: r=>r.title }, { id:'desc', header:'Description', renderCell: r=>r.body }]}
            items={rows}
            onDragAndDropEnd={({ activeId, destinationIndex }) => {
              if (destinationIndex == null) return
              setRows(prev => reorderById(prev, activeId, destinationIndex))
            }}
            renderItem={(item, ctx)=> (
              <Card data-dragging={ctx.isDragging || undefined} actions={<Button aria-label="Drag" {...ctx.handleProps}>≡</Button>}>
                <div className="card-title">{item.title}</div>
                <div className="subtle">{item.body}</div>
              </Card>
            )}
          />
        </StoryLayout>
      )
    }
  },
  'progress-track': {
    name: 'ProgressTrack',
    render: function ProgressStory(){
      const [val, setVal] = useState(3)
      return (
        <StoryLayout title="ProgressTrack" description="Discrete progress as pips/segments or a bar. Pips may show optional decoration (text/emoji).">
          <div style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(2, minmax(0,1fr))' }}>
            <ProgressTrack label="Pips with numbers" value={val} max={8} segments={[4,4]} onChange={setVal} getPipContent={(i, filled)=> i+1} />
            <ProgressTrack label="Pips with emoji" value={val} max={6} onChange={setVal} getPipContent={(i)=> ['⭐','🔥','💀','🗡️','🛡️','🧪'][i] } />
            <ProgressTrack label="Bar" value={val} max={8} onChange={setVal} variant="bar" />
          </div>
        </StoryLayout>
      )
    }
  },
  
  'clock-track': {
    name: 'ClockTrack',
    render: function ClockStory(){
      const [v, setV] = useState(4)
      return (
        <StoryLayout title="ClockTrack" description="Radial wedge clock with buttons to adjust.">
          <ClockTrack value={v} max={8} onChange={setV} />
        </StoryLayout>
      )
    }
  },
  'resource-panel': {
    name: 'ResourcePanel',
    render: function ResourceStory(){
      const [r, setR] = useState({ value:18, max:24, temp:6 })
      return (
        <StoryLayout title="ResourcePanel" description="Compact, responsive; temp shown as extended capacity color.">
          <ResourcePanel label="Health" value={r.value} max={r.max} temp={r.temp} onChange={setR} />
        </StoryLayout>
      )
    }
  },
  'counter': {
    name: 'Counter',
    render: function CounterStory(){
      const [n, setN] = useState(5)
      return (
        <StoryLayout title="Counter" description="Numeric input with +/- and direct edit. Long-press +/- to change the increment.">
          <Counter label="Count" value={n} onChange={setN} actions={<>
            <Button className="ghost" onClick={()=> alert('Pretend to throw a dice 🎲')}>🎲</Button>
            <Button className="ghost" onClick={()=> setN(0)}>Reset</Button>
          </>} />
        </StoryLayout>
      )
    }
  },
  'check-list': {
    name: 'CheckList',
    render: function CheckListStory(){
      const [items, setItems] = useState([
        { id:'c1', label:'Objective A', state:'off' },
        { id:'c2', label:'Objective B', state:'off' },
        { id:'c3', label:'Objective C', state:'on' },
      ])
      return (
        <StoryLayout title="CheckList" description="Binary checklist (on/off).">
          <CheckList items={items} onChange={setItems} />
        </StoryLayout>
      )
    }
  },
  'gauge': {
    name: 'Gauge',
    render: function GaugeStory(){
      const [v, setV] = useState(65)
      return (
        <StoryLayout title="Gauge" description="Continuous bar; shows temp capacity if provided.">
          <Gauge label="Energy" value={v} max={100} temp={20} thresholds={[{value:33},{value:66}]} />
          <div style={{ marginTop:12 }}>
            <Button variant="icon" onClick={()=> setV(x=> Math.max(0, x-5))}>-5</Button>
            <Button variant="icon" style={{ marginLeft:8 }} onClick={()=> setV(x=> Math.min(120, x+5))}>+5</Button>
          </div>
        </StoryLayout>
      )
    }
  },
  'collapsible': {
    name: 'Collapsible',
    render: function CollapsibleStory(){
      return (
        <StoryLayout title="Collapsible" description="Simple expandable panel.">
          <Collapsible title="Lore snippet" defaultOpen>
            <div className="subtle">The moon was a coin tossed into the black sea, and luck was not on our side.</div>
          </Collapsible>
        </StoryLayout>
      )
    }
   },
  'text-area': {
    name: 'Text Area (Edit/Preview)',
    render: function TextAreaStory(){
      const [text, setText] = useState(`# Notes

- Tap / for snippets
- **Bold** and *italic* supported
- Inline \`code\``)
      return (
        <StoryLayout title="Text Area" description="Editable notes with minimal syntax highlighting, suggestions, and a preview tab (updates on pause or blur).">
          <TextAreaWithPreview value={text} onChange={setText} />
        </StoryLayout>
      )
    }
  }
}

function StorybookChrome({ current, setCurrent }){
  const entries = Object.entries(Stories)
  const [q, setQ] = useState('')
  const filtered = entries.filter(([key, v]) => v.name.toLowerCase().includes(q.toLowerCase()))
  useEffect(()=>{
    const onHash = ()=>{
      const id = location.hash.replace('#','')
      if (id && Stories[id]) setCurrent(id)
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  }, [setCurrent])

  return (
    <div className="container">
      <div className="row">
        <div className="card" style={{ flex:1 }}>
          <div className="row" style={{ justifyContent:'space-between' }}>
            <div className="card-title">TTRPG Primitives – Mini Storybook</div>
            <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search stories" style={{ width:220, height:36, border:'var(--border)', borderRadius:8, background:'var(--surface-2)', color:'var(--text)', padding:'0 10px' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12, marginTop:12 }}>
            {filtered.map(([id, v])=> (
              <button key={id} className="card" style={{ textAlign:'left', cursor:'pointer' }} onClick={()=>{ setCurrent(id); location.hash = id }}>
                <div className="card-title">{v.name}</div>
                <div className="subtle" style={{ fontSize:13 }}>Open story</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop:16 }}>
        {current && React.createElement(Stories[current].render)}
      </div>
    </div>
  )
}

export default function App(){
  const [current, setCurrent] = useState('stack-drag-and-drop')
  return (
    <>
      <GlobalStyles />
      <StorybookChrome current={current} setCurrent={setCurrent} />
    </>
  )
}

