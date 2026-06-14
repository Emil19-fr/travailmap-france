import { useEffect, useRef, useState } from 'react'
import type { ActiveCategory } from '../types/city'
import { CATEGORIES, categoryLabel } from '../data/categories'

interface MetierSelectProps {
  value: ActiveCategory
  onChange: (value: ActiveCategory) => void
}

/** Sélecteur de métier (catégorie) — visible au-dessus de la carte. */
export default function MetierSelect({ value, onChange }: MetierSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const active = value !== 'all'

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const choose = (v: ActiveCategory) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <div className="metier" ref={rootRef}>
      <button
        className={'metier__btn' + (active ? ' is-active' : '')}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="metier__icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span className="metier__text">
          <span className="metier__eyebrow">Métier</span>
          <span className="metier__label">{categoryLabel(value)}</span>
        </span>
        <svg className="metier__chev" viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {active && (
        <button
          className="metier__reset"
          aria-label="Réinitialiser le métier"
          onClick={() => choose('all')}
        >
          ×
        </button>
      )}

      {open && (
        <ul className="metier__menu" role="listbox">
          <li>
            <button
              className={'metier__opt' + (value === 'all' ? ' is-active' : '')}
              onClick={() => choose('all')}
            >
              Tous les métiers
              {value === 'all' && <span className="metier__check">✓</span>}
            </button>
          </li>
          <li className="metier__sep" aria-hidden="true" />
          {CATEGORIES.map((c) => (
            <li key={c.key}>
              <button
                className={'metier__opt' + (value === c.key ? ' is-active' : '')}
                onClick={() => choose(c.key)}
              >
                {c.label}
                {value === c.key && <span className="metier__check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
