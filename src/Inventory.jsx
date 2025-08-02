import { useState } from 'react'

export default function Inventory({ items, onChange, onLog }) {
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

  return (
    <div className="inventory">
      <h2>Inventory</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <span>
              {item.name} ({item.qty}){item.notes ? ` - ${item.notes}` : ''}
            </span>
            <button onClick={() => startEdit(item.id)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="inventory-form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => handleFormChange('name', e.target.value)}
        />
        <input
          type="number"
          placeholder="Qty"
          value={form.qty}
          onChange={e => handleFormChange('qty', e.target.value)}
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
