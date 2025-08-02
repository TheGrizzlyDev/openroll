import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable'
import { useGameContext } from './GameContext'
import NumericInput from './components/NumericInput'

function SortableItem({ item, startEdit, handleDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  }

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>
        {item.name} ({item.qty}){item.notes ? ` - ${item.notes}` : ''}
      </span>
      <button onClick={() => startEdit(item.id)}>Edit</button>
      <button onClick={() => handleDelete(item.id)}>Delete</button>
    </li>
  )
}

export default function Inventory() {
  const {
    inventory: items,
    setInventory: onChange,
    scrolls,
    setScrolls,
    sheet,
    roll,
    logInventory: onLog
  } = useGameContext()
  const empty = { name: '', qty: 1, notes: '' }
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const emptyScroll = { name: '', type: 'unclean', casts: 1, notes: '' }
  const [scrollForm, setScrollForm] = useState(emptyScroll)
  const [editingScrollId, setEditingScrollId] = useState(null)

  const handleFormChange = (field, value) => {
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
    onChange([...items, newItem])
    onLog?.(`Added ${newItem.name} x${newItem.qty}`)
    resetForm()
  }

  const startEdit = (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setForm({ name: item.name, qty: item.qty, notes: item.notes })
    setEditingId(id)
  }

  const handleSave = () => {
    onChange(items.map(i => (i.id === editingId ? { ...i, ...form, qty: Number(form.qty) || 0 } : i)))
    onLog?.(`Updated ${form.name}`)
    resetForm()
  }

  const handleDelete = (id) => {
    const item = items.find(i => i.id === id)
    onChange(items.filter(i => i.id !== id))
    onLog?.(`Removed ${item?.name}`)
    if (editingId === id) resetForm()
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      onChange(arrayMove(items, oldIndex, newIndex))
    }
  }

  const handleScrollFormChange = (field, value) => {
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
    setScrolls([...scrolls, newScroll])
    onLog?.(`Added ${newScroll.type} scroll ${newScroll.name} (${newScroll.casts})`)
    resetScrollForm()
  }

  const startScrollEdit = (id) => {
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
    setScrolls(
      scrolls.map(s =>
        s.id === editingScrollId
          ? { ...s, ...scrollForm, casts: Number(scrollForm.casts) || 0 }
          : s
      )
    )
    onLog?.(`Updated scroll ${scrollForm.name}`)
    resetScrollForm()
  }

  const handleDeleteScroll = (id) => {
    const scroll = scrolls.find(s => s.id === id)
    setScrolls(scrolls.filter(s => s.id !== id))
    onLog?.(`Removed scroll ${scroll?.name}`)
    if (editingScrollId === id) resetScrollForm()
  }

  const handleCastScroll = (id) => {
    const scroll = scrolls.find(s => s.id === id)
    if (!scroll) return
    const result = roll(`1d20+${sheet.pre}`, `Cast ${scroll.name}`)
    const success = result >= 12
    const remaining = scroll.casts - 1
    onLog?.(
      `${scroll.name} ${success ? 'succeeds' : 'fails'} (${remaining} left)`
    )
    if (remaining <= 0) {
      setScrolls(scrolls.filter(s => s.id !== id))
      onLog?.(`${scroll.name} is spent`)
    } else {
      setScrolls(
        scrolls.map(s => (s.id === id ? { ...s, casts: remaining } : s))
      )
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
          placeholder="Name"
          value={form.name}
          onChange={e => handleFormChange('name', e.target.value)}
        />
        <NumericInput
          placeholder="Qty"
          value={form.qty}
          onChange={e => handleFormChange('qty', e.target.value)}
          min={0}
        />
        <input
          placeholder="Notes"
          value={form.notes}
          onChange={e => handleFormChange('notes', e.target.value)}
        />
        {editingId ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={resetForm}>Cancel</button>
          </>
        ) : (
          <button onClick={handleAdd}>Add</button>
        )}
      </div>
      <h2>Scrolls</h2>
      <ul>
        {scrolls.map(scroll => (
          <li key={scroll.id}>
            <span>
              {scroll.name} [{scroll.type}] ({scroll.casts})
              {scroll.notes ? ` - ${scroll.notes}` : ''}
            </span>
            <button onClick={() => handleCastScroll(scroll.id)}>Cast</button>
            <button onClick={() => startScrollEdit(scroll.id)}>Edit</button>
            <button onClick={() => handleDeleteScroll(scroll.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="inventory-form">
        <select
          value={scrollForm.type}
          onChange={e => handleScrollFormChange('type', e.target.value)}
        >
          <option value="unclean">Unclean</option>
          <option value="sacred">Sacred</option>
        </select>
        <input
          placeholder="Name"
          value={scrollForm.name}
          onChange={e => handleScrollFormChange('name', e.target.value)}
        />
        <input
          type="number"
          placeholder="Casts"
          value={scrollForm.casts}
          onChange={e => handleScrollFormChange('casts', e.target.value)}
        />
        <input
          placeholder="Notes"
          value={scrollForm.notes}
          onChange={e => handleScrollFormChange('notes', e.target.value)}
        />
        {editingScrollId ? (
          <>
            <button onClick={handleSaveScroll}>Save</button>
            <button onClick={resetScrollForm}>Cancel</button>
          </>
        ) : (
          <button onClick={handleAddScroll}>Add</button>
        )}
      </div>
    </div>
  )
}
