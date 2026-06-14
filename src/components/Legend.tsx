import { useEffect, useRef, useState } from 'react'
import { SCORE_BANDS } from '../lib/scoring'

const GLOSSARY: { term: string; def: string }[] = [
  {
    term: 'Marché très favorable',
    def: "Les employeurs recrutent difficilement, les opportunités sont nombreuses pour les candidats.",
  },
  {
    term: 'Marché favorable',
    def: "La demande de main-d'œuvre est supérieure à l'offre de candidats.",
  },
  {
    term: 'Marché équilibré',
    def: 'Offre et demande sont relativement équilibrées.',
  },
  {
    term: 'Marché défavorable',
    def: "Les opportunités sont moins nombreuses et la concurrence entre candidats est plus forte.",
  },
  {
    term: 'Marché très défavorable',
    def: "Recherche d'emploi plus difficile en raison d'un faible volume d'offres et d'une concurrence accrue.",
  },
  {
    term: 'Score de travaillabilité',
    def: "Indicateur composite basé sur les offres d'emploi, la tension du marché, les salaires estimés et le coût du logement.",
  },
]

export default function Legend() {
  const [open, setOpen] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth > 880 : true),
  )
  const [infoOpen, setInfoOpen] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  // Fermer l'info au clic extérieur (utile sur mobile).
  useEffect(() => {
    if (!infoOpen) return
    const onClick = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setInfoOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [infoOpen])

  return (
    <div className={'legend' + (open ? ' is-open' : '')}>
      <div className="legend__head">
        <button
          className="legend__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="legend__title">Légende</span>
          <svg className="legend__chev" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div
          className="legend__info"
          ref={infoRef}
          onMouseEnter={() => setInfoOpen(true)}
          onMouseLeave={() => setInfoOpen(false)}
        >
          <button
            className="legend__info-btn"
            aria-label="En savoir plus sur les indicateurs"
            aria-expanded={infoOpen}
            onClick={() => setInfoOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="11" x2="12" y2="16" />
              <circle cx="12" cy="7.6" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </button>

          {infoOpen && (
            <div className="legend__tooltip" role="dialog" aria-label="Définitions">
              <p className="legend__tooltip-title">Comprendre les indicateurs</p>
              <dl className="legend__gloss">
                {GLOSSARY.map((g) => (
                  <div key={g.term} className="legend__gloss-item">
                    <dt>{g.term}</dt>
                    <dd>{g.def}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ul className="legend__list">
        {SCORE_BANDS.map((b) => (
          <li key={b.key} className="legend__item">
            <span className="legend__swatch" style={{ background: b.color }} />
            <span className="legend__label">{b.label}</span>
            <span className="legend__desc">{b.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
