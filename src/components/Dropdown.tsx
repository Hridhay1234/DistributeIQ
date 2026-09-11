import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export type DropdownOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  /** Show a filter icon instead of the current label (e.g. "Filter" button). */
  filterIcon?: boolean
}

/** A `.pill-select` button that opens a small option menu — the functional
 * version of the period/sort/filter pills used across Dashboard & Reports. */
export default function Dropdown<T extends string>({
  value,
  options,
  onChange,
  filterIcon,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const current = options.find((o) => o.value === value)

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="pill-select"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {filterIcon && <Icon name="filter" size={15} />}
        {current?.label ?? value}
        <Icon name="chevron-down" size={15} />
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={'dropdown-item' + (o.value === value ? ' active' : '')}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
