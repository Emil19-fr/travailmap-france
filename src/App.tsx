import { useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import Filters from './components/Filters'
import Legend from './components/Legend'
import InfoPanel from './components/InfoPanel'
import { CITIES } from './data/cities'
import { enrichCities } from './lib/scoring'
import { DEFAULT_FILTERS, useFilteredCities, type FilterState } from './hooks/useFilteredCities'
import type { ActiveCategory, EnrichedCity } from './types/city'

const REGIONS = Array.from(new Set(CITIES.map((c) => c.region))).sort((a, b) =>
  a.localeCompare(b, 'fr'),
)

export default function App() {
  const [category, setCategory] = useState<ActiveCategory>('all')
  const enriched = useMemo(() => enrichCities(CITIES, category), [category])

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const filtered = useFilteredCities(enriched, filters)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useMemo(
    () => enriched.find((c) => c.id === selectedId) ?? null,
    [enriched, selectedId],
  )

  const [focus, setFocus] = useState<{ lat: number; lng: number; nonce: number } | null>(null)
  const nonce = useRef(0)
  const [sheetOpen, setSheetOpen] = useState(false)

  const patchFilters = (patch: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  const handleSelect = (city: EnrichedCity) => {
    setSelectedId(city.id)
    nonce.current += 1
    setFocus({ lat: city.lat, lng: city.lng, nonce: nonce.current })
    setSheetOpen(false)
  }

  return (
    <div className="app">
      <MapView
        cities={filtered}
        selected={selected}
        onSelectCity={handleSelect}
        focus={focus}
      />

      <div className="brand">
        <span className="brand__pin" aria-hidden="true" />
        <span className="brand__mark">TravailMap</span>
        <span className="brand__sub">France</span>
      </div>

      <div className="topbar">
        <SearchBar cities={enriched} onSelect={handleSelect} />
      </div>

      <aside className={'sidebar' + (sheetOpen ? ' is-open' : '')}>
        <button
          className="sidebar__close"
          onClick={() => setSheetOpen(false)}
          aria-label="Fermer les filtres"
        >
          ×
        </button>
        <div className="sidebar__scroll">
          <Filters
            filters={filters}
            onChange={patchFilters}
            onReset={() => {
              setFilters(DEFAULT_FILTERS)
              setCategory('all')
            }}
            category={category}
            onCategoryChange={setCategory}
            regions={REGIONS}
            results={filtered}
            total={enriched.length}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </aside>

      {sheetOpen && <div className="scrim" onClick={() => setSheetOpen(false)} />}

      <button
        className="fab"
        onClick={() => setSheetOpen((o) => !o)}
        aria-label="Ouvrir les filtres et résultats"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
        Filtres
      </button>

      <Legend />

      <InfoPanel city={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
