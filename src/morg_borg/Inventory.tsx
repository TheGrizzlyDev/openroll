import { useState, type ChangeEvent } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable'
import { useGameContext, type InventoryItem, type Scroll } from '../GameContext'
import NumericInput from '../components/NumericInput'
import SmartTextEditor from '../components/SmartTextEditor'
import { Select } from '../ui/Select'
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
        <button className="base-button" onClick={() => startEdit(item.id)}>Edit</button>
        <button className="base-button" onClick={() => handleDelete(item.id)}>Delete</button>
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
        <button className="base-button" onClick={() => handleCast(scroll.id)}>Cast</button>
        <button className="base-button" onClick={() => startEdit(scroll.id)}>Edit</button>
        <button className="base-button" onClick={() => handleDelete(scroll.id)}>Delete</button>
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
  type ScrollForm = Omit<Scroll, 'id' | 'casts'> & { casts: number | string }
  const emptyScroll: ScrollForm = { name: '', type: 'unclean', casts: 1, notes: '' }
  const [scrollForm, setScrollForm] = useState<ScrollForm>(emptyScroll)
  const [editingScrollId, setEditingScrollId] = useState<number | null>(null)

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
  }

  const startEdit = (id: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setForm({ name: item.name, qty: item.qty, notes: item.notes })
    setEditingId(id)
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
  }

  const handleDelete = (id: number) => {
    const item = items.find(i => i.id === id)
    dispatch({ type: 'SET_INVENTORY', inventory: items.filter(i => i.id !== id) })
    onLog?.(`Removed ${item?.name}`)
    if (editingId === id) resetForm()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      dispatch({ type: 'SET_INVENTORY', inventory: arrayMove(items, oldIndex, newIndex) })
    }
  }

  const handleScrollDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
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
  }

  const handleDeleteScroll = (id: number) => {
    const scroll = scrolls.find(s => s.id === id)
    dispatch({ type: 'SET_SCROLLS', scrolls: scrolls.filter(s => s.id !== id) })
    onLog?.(`Removed scroll ${scroll?.name}`)
    if (editingScrollId === id) resetScrollForm()
  }

  const handleCastScroll = (id: number) => {
    const scroll = scrolls.find(s => s.id === id)
    if (!scroll) return
    const result = roll(`1d20+${sheet.pre}`, `Cast ${scroll.name}`)
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
      <h2>Inventory</h2>
      <DndContext onDragEnd={handleDragEnd}>
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
      <div className="inventory-form">
        <input
          className="base-input"
          placeholder="Name"
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('name', e.target.value)}
        />
        <NumericInput
          placeholder="Qty"
          value={form.qty}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('qty', e.target.value)}
          min={0}
        />
        <SmartTextEditor
          value={form.notes}
          onChange={value => handleFormChange('notes', value)}
        />
        {editingId ? (
          <>
            <button className="base-button" onClick={handleSave}>Save</button>
            <button className="base-button" onClick={resetForm}>Cancel</button>
          </>
        ) : (
          <button className="base-button" onClick={handleAdd}>Add</button>
        )}
      </div>
      <h2>Scrolls</h2>
      <DndContext onDragEnd={handleScrollDragEnd}>
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
        <input
          className="base-input"
          placeholder="Name"
          value={scrollForm.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleScrollFormChange('name', e.target.value)}
        />
        <input
          className="base-input"
          type="number"
          placeholder="Casts"
          value={scrollForm.casts}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleScrollFormChange('casts', e.target.value)}
        />
        <SmartTextEditor
          value={scrollForm.notes}
          onChange={value => handleScrollFormChange('notes', value)}
        />
        {editingScrollId ? (
          <>
            <button className="base-button" onClick={handleSaveScroll}>Save</button>
            <button className="base-button" onClick={resetScrollForm}>Cancel</button>
          </>
        ) : (
          <button className="base-button" onClick={handleAddScroll}>Add</button>
        )}
      </div>
    </div>
  )
}
