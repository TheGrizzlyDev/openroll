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
  const { inventory: items, setInventory: onChange, logInventory: onLog } = useGameContext()
  const empty = { name: '', qty: 1, notes: '' }
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)

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
    </div>
  )
}
