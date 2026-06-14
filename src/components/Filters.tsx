import type { ActiveCategory, EnrichedCity } from '../types/city'
import type { FilterState } from '../hooks/useFilteredCities'
import { formatNumber, formatOpportunities } from '../lib/format'
import MetierSelect from './MetierSelect'

interface FiltersProps {
  filters: FilterState
  onChange: (patch: Partial<FilterState>) => void
  onReset: () => void
  category: ActiveCategory
  onCategoryChange: (category: ActiveCategory) => void
  regions: string[]
  results: EnrichedCity[]
  total: number
  selectedId: string | null
  onSelect: (city: EnrichedCity) => void
}

const OPPORTUNITY_STEPS = [
  { value: 0, label: 'Toutes' },
  { value: 2000, label: '2 000+' },
  { value: 10000, label: '10 000+' },
  { value: 30000, label: '30 000+' },
]

export default function Filters({
  filters,
  onChange,
  onReset,
  category,
  onCategoryChange,
  regions,
  results,
  total,
  selectedId,
  onSelect,
}: FiltersProps) {
  return (
    <div className="filters">
      <div className="filters__row filters__row--head">
        <h2 className="filters__title">Filtres</h2>
        <button className="btn btn--ghost btn--sm" onClick={onReset}>
          Réinitialiser
        </button>
      </div>

      {/* Métier */}
      <div className="field">
        <label>Métier</label>
        <MetierSelect value={category} onChange={onCategoryChange} />
      </div>

      {/* Score minimum */}
      <div className="field">
        <div className="field__head">
          <label htmlFor="f-score">Score minimum</label>
          <span className="field__value">{filters.minScore}</span>
        </div>
        <input
          id="f-score"
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minScore}
          onChange={(e) => onChange({ minScore: Number(e.target.value) })}
        />
      </div>

      {/* Salaire minimum */}
      <div className="field">
        <div className="field__head">
          <label htmlFor="f-salary">Salaire minimum</label>
          <span className="field__value">
            {filters.minSalary <= 1500 ? 'Indifférent' : `${formatNumber(filters.minSalary)} €`}
          </span>
        </div>
        <input
          id="f-salary"
          type="range"
          min={1500}
          max={3000}
          step={50}
          value={filters.minSalary}
          onChange={(e) => onChange({ minSalary: Number(e.target.value) })}
        />
      </div>

      {/* Coût du logement maximum */}
      <div className="field">
        <div className="field__head">
          <label htmlFor="f-housing">Logement max.</label>
          <span className="field__value">
            {filters.maxHousing >= 10000
              ? 'Indifférent'
              : `${formatNumber(filters.maxHousing)} €/m²`}
          </span>
        </div>
        <input
          id="f-housing"
          type="range"
          min={2000}
          max={10000}
          step={100}
          value={filters.maxHousing}
          onChange={(e) => onChange({ maxHousing: Number(e.target.value) })}
        />
      </div>

      {/* Région */}
      <div className="field">
        <label htmlFor="f-region">Région</label>
        <select
          id="f-region"
          value={filters.region}
          onChange={(e) => onChange({ region: e.target.value })}
        >
          <option value="all">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Tension */}
      <div className="field">
        <label htmlFor="f-tension">Niveau de tension</label>
        <select
          id="f-tension"
          value={filters.tension}
          onChange={(e) => onChange({ tension: e.target.value as FilterState['tension'] })}
        >
          <option value="all">Tous niveaux</option>
          <option value="tres-elevee">Très élevée</option>
          <option value="elevee">Élevée</option>
          <option value="moderee">Modérée</option>
          <option value="faible">Faible</option>
        </select>
      </div>

      {/* Opportunités */}
      <div className="field">
        <label>Opportunités d'emploi</label>
        <div className="segmented">
          {OPPORTUNITY_STEPS.map((s) => (
            <button
              key={s.value}
              className={
                'segmented__item' +
                (filters.minOpportunities === s.value ? ' is-active' : '')
              }
              onClick={() => onChange({ minOpportunities: s.value })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tri */}
      <div className="field">
        <label htmlFor="f-sort">Trier par score</label>
        <select
          id="f-sort"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as FilterState['sort'] })}
        >
          <option value="score-desc">Du plus élevé au plus faible</option>
          <option value="score-asc">Du plus faible au plus élevé</option>
        </select>
      </div>

      <div className="filters__count">
        {results.length} ville{results.length > 1 ? 's' : ''} affichée
        {results.length > 1 ? 's' : ''} sur {total}
      </div>

      {/* Résultats */}
      <ul className="results">
        {results.map((c) => (
          <li key={c.id}>
            <button
              className={'result' + (selectedId === c.id ? ' is-selected' : '')}
              onClick={() => onSelect(c)}
            >
              <span className="result__score" style={{ background: c.band.color }}>
                {c.score}
              </span>
              <span className="result__text">
                <span className="result__name">{c.name}</span>
                <span className="result__meta">
                  {c.region} · {formatOpportunities(c.offers)}
                </span>
              </span>
              <span className="result__chev" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="results__empty">
            Aucune ville ne correspond. Élargissez les filtres pour voir plus de résultats.
          </li>
        )}
      </ul>
    </div>
  )
}
