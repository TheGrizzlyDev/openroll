import { createContext, useContext, useId, useState, type ReactNode, type KeyboardEvent, type ButtonHTMLAttributes, useRef } from 'react'

interface TabsContextValue {
  value: string
  setValue: (_value: string) => void
  idBase: string
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (_value: string) => void
  children?: ReactNode
}

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue ?? '')
  const idBase = useId()
  const activeValue = controlledValue ?? value

  const handleSetValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue: handleSetValue, idBase }}>
      {children}
    </TabsContext.Provider>
  )
}

interface TabListProps {
  children?: ReactNode
  className?: string
}

export function TabList({ children, className = '' }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    )
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement)
    let newIndex = currentIndex
    if (event.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabs.length
    } else if (event.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length
    } else if (event.key === 'Home') {
      newIndex = 0
    } else if (event.key === 'End') {
      newIndex = tabs.length - 1
    }
    if (newIndex !== currentIndex && tabs[newIndex]) {
      tabs[newIndex].focus()
      event.preventDefault()
    }
  }

  return (
    <div role="tablist" ref={listRef} onKeyDown={onKeyDown} className={`flex ${className}`}>
      {children}
    </div>
  )
}

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function Tab({ value, className = '', children, ...props }: TabProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')
  const { value: activeValue, setValue, idBase } = context
  const selected = activeValue === value
  const id = `${idBase}-tab-${value}`
  const panelId = `${idBase}-panel-${value}`
  const baseClasses =
    'bg-bg-alt border border-accent rounded-[var(--border-radius)] text-accent cursor-pointer font-body font-bold tracking-wider py-2 px-4 uppercase transition-colors hover:bg-accent hover:text-bg flex-1'
  const activeClasses = selected ? ' bg-accent text-bg' : ''

  return (
    <button
      {...props}
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      className={`${baseClasses}${activeClasses} ${className}`}
      onClick={(e) => {
        setValue(value)
        props.onClick?.(e)
      }}
    >
      {children}
    </button>
  )
}

interface TabPanelProps {
  value: string
  children?: ReactNode
  className?: string
}

export function TabPanel({ value, children, className = '' }: TabPanelProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')
  const { value: activeValue, idBase } = context
  const hidden = activeValue !== value
  const id = `${idBase}-panel-${value}`
  const tabId = `${idBase}-tab-${value}`

  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={tabId}
      hidden={hidden}
      className={className}
    >
      {!hidden && children}
    </div>
  )
}

export default Tabs
