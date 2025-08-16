import { useState, type ChangeEvent } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import SortableList from '../components/SortableList'
import InventoryItem from '../components/InventoryItem'
import { useGameContext, type Scroll } from '../stores/GameContext'
import SmartTextEditor from '../components/SmartTextEditor'
import { Input, Select, Button, Dialog } from '../design-system'
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

export default function Inventory() {
  const {
    state: { inventory: items, scrolls, sheet },
    dispatch,
    roll,
    logInventory: onLog
  } = useGameContext()
  type InventoryForm = { name: string; notes: string }
  const empty: InventoryForm = { name: '', notes: '' }
  const [form, setForm] = useState<InventoryForm>(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showItemPopup, setShowItemPopup] = useState(false)
  type ScrollForm = Omit<Scroll, 'id' | 'casts'> & { casts: number | string }
  const emptyScroll: ScrollForm = { name: '', type: 'unclean', casts: 1, notes: '' }
  const [scrollForm, setScrollForm] = useState<ScrollForm>(emptyScroll)
  const [editingScrollId, setEditingScrollId] = useState<number | null>(null)
  const [showScrollPopup, setShowScrollPopup] = useState(false)
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
      qty: 1,
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
    setForm({ name: item.name, notes: item.notes })
    setEditingId(id)
    setShowItemPopup(true)
  }

  const handleSave = () => {
    dispatch({
      type: 'SET_INVENTORY',
      inventory: items.map(i =>
        i.id === editingId ? { ...i, name: form.name, notes: form.notes } : i
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
      <div>
      <h2>
        Inventory <Button onClick={() => { resetForm(); setShowItemPopup(true) }}>Add</Button>
      </h2>
      <SortableList
        items={items}
        onReorder={list => dispatch({ type: 'SET_INVENTORY', inventory: list })}
        renderItem={item => (
          <InventoryItem
            key={item.id}
            item={item}
            actions={
              <>
                <Button onClick={() => startEdit(item.id)}>Edit</Button>
                <Button onClick={() => handleDelete(item.id)}>Delete</Button>
              </>
            }
          />
        )}
      />
      <h2>
        Scrolls <Button onClick={() => { resetScrollForm(); setShowScrollPopup(true) }}>Add</Button>
      </h2>
        <SortableList
          items={scrolls}
          onReorder={list => dispatch({ type: 'SET_SCROLLS', scrolls: list })}
          renderItem={scroll => (
            <InventoryItem
              key={scroll.id}
              item={scroll}
              actions={
                <>
                  <Button onClick={() => handleCastScroll(scroll.id)}>Cast</Button>
                  <Button onClick={() => startScrollEdit(scroll.id)}>Edit</Button>
                  <Button onClick={() => handleDeleteScroll(scroll.id)}>Delete</Button>
                </>
              }
            />
          )}
        />
        {showItemPopup && (
          <Dialog.Root
            open={showItemPopup}
            onOpenChange={open => {
              if (!open) {
                resetForm()
                setShowItemPopup(false)
              }
            }}
          >
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <div className="flex min-w-60 flex-col gap-2">
                  <div style={{ flex: 1 }}>
                    <Input
                      placeholder="Name"
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleFormChange('name', e.target.value)
                }
              />
            </div>
            <SmartTextEditor
              value={form.notes}
              onChange={value => handleFormChange('notes', value)}
            />
                  <div className="flex justify-end gap-2">
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
                <Dialog.CloseTrigger asChild>
                  <Button type="button">×</Button>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
        {showScrollPopup && (
          <Dialog.Root
            open={showScrollPopup}
            onOpenChange={open => {
              if (!open) {
                resetScrollForm()
                setShowScrollPopup(false)
              }
            }}
          >
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <div className="flex min-w-60 flex-col gap-2">
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
                  <div className="flex justify-end gap-2">
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
                <Dialog.CloseTrigger asChild>
                  <Button type="button">×</Button>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
    </div>
  )
}
