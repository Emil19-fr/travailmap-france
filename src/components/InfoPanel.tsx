import type { EnrichedCity } from '../types/city'
import ScoreRing from './ScoreRing'
import { formatNumber } from '../lib/format'
import { categoryLabel } from '../data/categories'

interface InfoPanelProps {
  city: EnrichedCity | null
  onClose: () => void
}

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <span className="meter" aria-hidden="true">
      <span className="meter__fill" style={{ width: `${value}%`, background: color }} />
    </span>
  )
}

export default function InfoPanel({ city, onClose }: InfoPanelProps) {
  return (
    <aside className={'panel' + (city ? ' is-open' : '')} aria-hidden={!city}>
      {city && (
        <div className="panel__inner">
          <button className="panel__close" onClick={onClose} aria-label="Fermer le panneau">
            ×
          </button>

          <header className="panel__head">
            <span className="panel__sector">{categoryLabel(city.category)}</span>
            <h2 className="panel__name">{city.name}</h2>
            <p className="panel__region">{city.region}</p>
          </header>

          <section className="panel__hero">
            <ScoreRing score={city.score} color={city.band.color} size={92} />
            <div className="panel__hero-info">
              <span
                className="badge"
                style={{ color: city.band.color, background: `${city.band.color}1a` }}
              >
                Travaillabilité {city.band.label.toLowerCase()}
              </span>
              <p className="panel__band-desc">{city.band.description}</p>
            </div>
          </section>

          <section className="stats">
            <div className="stat">
              <span className="stat__label">Offres d'emploi</span>
              <span className="stat__value">{formatNumber(city.offers)}</span>
              <span className="stat__unit">
                {city.category === 'all' ? 'tous secteurs' : 'dans le secteur'}
              </span>
            </div>

            <div className="stat">
              <span className="stat__label">Salaire net</span>
              <span className="stat__value">{formatNumber(city.salaryNet)} €</span>
              <span className="stat__unit">par mois</span>
            </div>

            <div className="stat stat--wide">
              <div className="stat__row">
                <span className="stat__label">Tension du marché</span>
                <span className="stat__tag">{city.tensionLevel.label}</span>
              </div>
              <Meter value={city.tension} color={city.band.color} />
            </div>

            <div className="stat stat--wide">
              <div className="stat__row">
                <span className="stat__label">Dynamisme économique</span>
                <span className="stat__tag">{city.dynamism}/100</span>
              </div>
              <Meter value={city.dynamism} color="#1F3A5F" />
            </div>

            <div className="stat stat--wide">
              <div className="stat__row">
                <span className="stat__label">Coût du logement</span>
                <span className="stat__value stat__value--inline">
                  {formatNumber(city.housingPricePerM2)} €/m²
                </span>
              </div>
            </div>
          </section>

          <section className="reco">
            <div className="reco__label">Recommandation</div>
            <p className="reco__text">{city.recommendation}</p>
          </section>
        </div>
      )}
    </aside>
  )
}
