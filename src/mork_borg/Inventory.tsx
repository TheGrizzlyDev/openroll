import { useState, type ChangeEvent } from 'react'
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable'
import { useGameContext, type InventoryItem, type Scroll } from '../GameContext'
import NumericInput from '../components/NumericInput'
import SmartTextEditor from '../components/SmartTextEditor'
import { Input, Select, Button } from '../design-system'
import Popup from '../components/Popup'
import { renderOml } from '../oml/render'

interface SortableItemProps {
  item: InventoryItem
  startEdit: (_id: number) => void
  handleDelete: (_id: number) => void
}

function SortableItem({ item, startEdit, handleDelete }: SortableItemProps) {
  const { roll } = useGameContext()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dragging' : ''}
    >
      <span className="drag-handle" {...attributes} {...listeners}>::</span>
      <div>
        <span>
          {item.name} ({item.qty})
          {item.notes ? <> - {renderOml(item.notes, roll)}</> : ''}
        </span>
        <Button onClick={() => startEdit(item.id)}>Edit</Button>
        <Button onClick={() => handleDelete(item.id)}>Delete</Button>
      </div>
    </li>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function reorderScrolls(
  scrolls: Scroll[],
  activeId: number,
  overId: number
) {
  const oldIndex = scrolls.findIndex(s => s.id === activeId)
  const newIndex = scrolls.findIndex(s => s.id === overId)
  return arrayMove(scrolls, oldIndex, newIndex)
}

interface SortableScrollProps {
  scroll: Scroll
  startEdit: (_id: number) => void
  handleDelete: (_id: number) => void
  handleCast: (_id: number) => void
}

function SortableScroll({
  scroll,
  startEdit,
  handleDelete,
  handleCast
}: SortableScrollProps) {
  const { roll } = useGameContext()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: scroll.id })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dragging' : ''}
    >
      <span className="drag-handle" {...attributes} {...listeners}>::</span>
      <div>
        <span>
          {scroll.name} [{scroll.type}] ({scroll.casts})
          {scroll.notes ? <> - {renderOml(scroll.notes, roll)}</> : ''}
        </span>
        <Button onClick={() => handleCast(scroll.id)}>Cast</Button>
        <Button onClick={() => startEdit(scroll.id)}>Edit</Button>
        <Button onClick={() => handleDelete(scroll.id)}>Delete</Button>
      </div>
    </li>
  )
}

export default function Inventory() {
  const {
    state: { inventory: items, scrolls, sheet },
    dispatch,
    roll,
    logInventory: onLog
  } = useGameContext()
  type InventoryForm = { name: string; qty: number | string; notes: string }
  const empty: InventoryForm = { name: '', qty: 1, notes: '' }
  const [form, setForm] = useState<InventoryForm>(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showItemPopup, setShowItemPopup] = useState(false)
  type ScrollForm = Omit<Scroll, 'id' | 'casts'> & { casts: number | string }
  const emptyScroll: ScrollForm = { name: '', type: 'unclean', casts: 1, notes: '' }
  const [scrollForm, setScrollForm] = useState<ScrollForm>(emptyScroll)
  const [editingScrollId, setEditingScrollId] = useState<number | null>(null)
  const [showScrollPopup, setShowScrollPopup] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))
  const [startPointerY, setStartPointerY] = useState(0)

  const handleFormChange = <K extends keyof InventoryForm>(
    field: K,
    value: InventoryForm[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setForm(empty)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!form.name) return
    const newItem = {
      id: Date.now(),
      name: form.name,
      qty: Number(form.qty) || 0,
      notes: form.notes
    }
    dispatch({ type: 'SET_INVENTORY', inventory: [...items, newItem] })
    onLog?.(`Added ${newItem.name} x${newItem.qty}`)
    resetForm()
    setShowItemPopup(false)
  }

  const startEdit = (id: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setForm({ name: item.name, qty: item.qty, notes: item.notes })
    setEditingId(id)
    setShowItemPopup(true)
  }

  const handleSave = () => {
    dispatch({
      type: 'SET_INVENTORY',
      inventory: items.map(i =>
        i.id === editingId ? { ...i, ...form, qty: Number(form.qty) || 0 } : i
      )
    })
    onLog?.(`Updated ${form.name}`)
    resetForm()
    setShowItemPopup(false)
  }

  const handleDelete = (id: number) => {
    const item = items.find(i => i.id === id)
    dispatch({ type: 'SET_INVENTORY', inventory: items.filter(i => i.id !== id) })
    onLog?.(`Removed ${item?.name}`)
    if (editingId === id) {
      resetForm()
      setShowItemPopup(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activator = event.activatorEvent as PointerEvent | TouchEvent | KeyboardEvent
    let y = 0
    if ('touches' in activator) {
      y = activator.touches[0]?.clientY ?? 0
    } else if ('clientY' in activator) {
      y = activator.clientY ?? 0
    }
    setStartPointerY(y)
    document.body.style.overflow = 'hidden'
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const currentY = startPointerY + event.delta.y
    const threshold = 40
    const viewportHeight = window.innerHeight
    if (currentY < threshold) {
      window.scrollBy({ top: -10 })
    } else if (currentY > viewportHeight - threshold) {
      window.scrollBy({ top: 10 })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    document.body.style.overflow = ''
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      dispatch({ type: 'SET_INVENTORY', inventory: arrayMove(items, oldIndex, newIndex) })
    }
  }

  const handleScrollDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    document.body.style.overflow = ''
    if (over && active.id !== over.id) {
      dispatch({
        type: 'SET_SCROLLS',
        scrolls: reorderScrolls(scrolls, Number(active.id), Number(over.id))
      })
    }
  }

  const handleScrollFormChange = <K extends keyof ScrollForm>(
    field: K,
    value: ScrollForm[K]
  ) => {
    setScrollForm(prev => ({ ...prev, [field]: value }))
  }

  const resetScrollForm = () => {
    setScrollForm(emptyScroll)
    setEditingScrollId(null)
  }

  const handleAddScroll = () => {
    if (!scrollForm.name) return
    const newScroll = {
      id: Date.now(),
      type: scrollForm.type,
      name: scrollForm.name,
      casts: Number(scrollForm.casts) || 0,
      notes: scrollForm.notes
    }
    dispatch({ type: 'SET_SCROLLS', scrolls: [...scrolls, newScroll] })
    onLog?.(`Added ${newScroll.type} scroll ${newScroll.name} (${newScroll.casts})`)
    resetScrollForm()
    setShowScrollPopup(false)
  }

  const startScrollEdit = (id: number) => {
    const scroll = scrolls.find(s => s.id === id)
    if (!scroll) return
    setScrollForm({
      name: scroll.name,
      type: scroll.type,
      casts: scroll.casts,
      notes: scroll.notes
    })
    setEditingScrollId(id)
    setShowScrollPopup(true)
  }

  const handleSaveScroll = () => {
    dispatch({
      type: 'SET_SCROLLS',
      scrolls: scrolls.map(s =>
        s.id === editingScrollId
          ? { ...s, ...scrollForm, casts: Number(scrollForm.casts) || 0 }
          : s
      )
    })
    onLog?.(`Updated scroll ${scrollForm.name}`)
    resetScrollForm()
    setShowScrollPopup(false)
  }

  const handleDeleteScroll = (id: number) => {
    const scroll = scrolls.find(s => s.id === id)
    dispatch({ type: 'SET_SCROLLS', scrolls: scrolls.filter(s => s.id !== id) })
    onLog?.(`Removed scroll ${scroll?.name}`)
    if (editingScrollId === id) {
      resetScrollForm()
      setShowScrollPopup(false)
    }
  }

  const handleCastScroll = (id: number) => {
    const scroll = scrolls.find(s => s.id === id)
    if (!scroll) return
    const { total: result } = roll(`1d20+${sheet.pre}`, `Cast ${scroll.name}`)
    const success = result >= 12
    const remaining = scroll.casts - 1
    onLog?.(
      `${scroll.name} ${success ? 'succeeds' : 'fails'} (${remaining} left)`
    )
    if (remaining <= 0) {
      dispatch({ type: 'SET_SCROLLS', scrolls: scrolls.filter(s => s.id !== id) })
      onLog?.(`${scroll.name} is spent`)
    } else {
      dispatch({
        type: 'SET_SCROLLS',
        scrolls: scrolls.map(s => (s.id === id ? { ...s, casts: remaining } : s))
      })
    }
  }

  return (
    <div className="inventory">
      <h2>
        Inventory <Button onClick={() => { resetForm(); setShowItemPopup(true) }}>Add</Button>
      </h2>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(i => i.id)}>
          <ul>
            {items.map(item => (
              <SortableItem
                key={item.id}
                item={item}
                startEdit={startEdit}
                handleDelete={handleDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <h2>
        Scrolls <Button onClick={() => { resetScrollForm(); setShowScrollPopup(true) }}>Add</Button>
      </h2>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleScrollDragEnd}
      >
        <SortableContext items={scrolls.map(s => s.id)}>
          <ul className="scrolls">
            {scrolls.map(scroll => (
              <SortableScroll
                key={scroll.id}
                scroll={scroll}
                startEdit={startScrollEdit}
                handleDelete={handleDeleteScroll}
                handleCast={handleCastScroll}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {showItemPopup && (
        <Popup
          visible={showItemPopup}
          onClose={() => {
            resetForm()
            setShowItemPopup(false)
          }}
        >
          <div className="inventory-form">
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleFormChange('name', e.target.value)
                }
              />
            </div>
            <NumericInput
              placeholder="Qty"
              value={form.qty}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFormChange('qty', e.target.value)
              }
              min={0}
            />
            <SmartTextEditor
              value={form.notes}
              onChange={value => handleFormChange('notes', value)}
            />
            <div className="inventory-actions">
              {editingId ? (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button
                    onClick={() => {
                      resetForm()
                      setShowItemPopup(false)
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAdd}>Add</Button>
              )}
            </div>
          </div>
        </Popup>
      )}
      {showScrollPopup && (
        <Popup
          visible={showScrollPopup}
          onClose={() => {
            resetScrollForm()
            setShowScrollPopup(false)
          }}
        >
          <div className="inventory-form">
            <Select
              value={scrollForm.type}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleScrollFormChange('type', e.target.value as ScrollForm['type'])
              }
            >
              <option value="unclean">Unclean</option>
              <option value="sacred">Sacred</option>
            </Select>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Name"
                value={scrollForm.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleScrollFormChange('name', e.target.value)
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                type="number"
                placeholder="Casts"
                value={scrollForm.casts}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleScrollFormChange('casts', e.target.value)
                }
              />
            </div>
            <SmartTextEditor
              value={scrollForm.notes}
              onChange={value => handleScrollFormChange('notes', value)}
            />
            <div className="inventory-actions">
              {editingScrollId ? (
                <>
                  <Button onClick={handleSaveScroll}>Save</Button>
                  <Button
                    onClick={() => {
                      resetScrollForm()
                      setShowScrollPopup(false)
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddScroll}>Add</Button>
              )}
            </div>
          </div>
        </Popup>
      )}
    </div>
  )
}
