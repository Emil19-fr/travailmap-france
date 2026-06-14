import { useEffect, useMemo, useRef, useState } from 'react'
import type { EnrichedCity } from '../types/city'

interface SearchBarProps {
  cities: EnrichedCity[]
  onSelect: (city: EnrichedCity) => void
}

/** Retire les accents et passe en minuscules pour une recherche tolérante. */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function SearchBar({ cities, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return []
    return cities
      .filter((c) => normalize(c.name).includes(q) || normalize(c.region).includes(q))
      .slice(0, 6)
  }, [query, cities])

  // Fermer au clic extérieur.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => setActive(0), [query])

  const choose = (city: EnrichedCity) => {
    onSelect(city)
    setQuery(city.name)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || matches.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + matches.length) % matches.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(matches[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="search" ref={rootRef}>
      <div className="search__field">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          className="search__input"
          type="text"
          value={query}
          placeholder="Rechercher une ville…"
          aria-label="Rechercher une ville"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            className="search__clear"
            aria-label="Effacer la recherche"
            onClick={() => {
              setQuery('')
              setOpen(false)
            }}
          >
            ×
          </button>
        )}
      </div>

      {open && matches.length > 0 && (
        <ul className="search__results" role="listbox">
          {matches.map((c, i) => (
            <li
              key={c.id}
              role="option"
              aria-selected={i === active}
              className={'search__option' + (i === active ? ' is-active' : '')}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(c)
              }}
            >
              <span className="search__dot" style={{ background: c.band.color }} />
              <span className="search__name">{c.name}</span>
              <span className="search__region">{c.region}</span>
              <span className="search__score" style={{ color: c.band.color }}>
                {c.score}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
