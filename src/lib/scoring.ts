import type {
  ActiveCategory,
  CategoryKey,
  CategoryStats,
  City,
  EnrichedCity,
  ScoreBand,
  ScoreBandKey,
  TensionLevel,
} from '../types/city'
import { CATEGORY_KEYS, categoryLabel } from '../data/categories'

/**
 * Pondération du score de travaillabilité (total = 100 %), calculé pour le
 * MÉTIER ACTIF :
 *   40 % offres du secteur · 30 % tension du secteur · 20 % salaire du secteur
 *   · 10 % coût du logement local.
 */
export const SCORE_WEIGHTS = {
  offers: 0.4,
  tension: 0.3,
  salary: 0.2,
  housing: 0.1,
} as const

/** Bornes de référence FIXES (l'ajout d'une ville ne recalibre pas les autres). */
const REF = {
  salaryMin: 1_700,
  salaryMax: 3_000,
  housingMin: 2_000,
  housingMax: 10_000,
} as const

/** Le nombre d'offres n'a pas la même échelle pour un secteur seul ou pour l'agrégat. */
const OFFERS_REF = {
  category: { min: 800, max: 50_000 },
  all: { min: 8_000, max: 200_000 },
} as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function normalizeLog(value: number, min: number, max: number): number {
  const v = Math.max(value, min)
  return clamp01((Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min)))
}

function normalizeLinear(value: number, min: number, max: number): number {
  return clamp01((value - min) / (max - min))
}

function normalizeOffers(offers: number, category: ActiveCategory): number {
  const ref = category === 'all' ? OFFERS_REF.all : OFFERS_REF.category
  return normalizeLog(offers, ref.min, ref.max)
}

/** Indicateurs du métier actif (ou agrégat pondéré par les offres pour « all »). */
export function statsFor(city: City, category: ActiveCategory): CategoryStats {
  if (category !== 'all') return city.jobsByCategory[category]

  let offers = 0
  let tensionWeighted = 0
  let salaryWeighted = 0
  for (const key of CATEGORY_KEYS) {
    const s = city.jobsByCategory[key]
    offers += s.offers
    tensionWeighted += s.tension * s.offers
    salaryWeighted += s.salaryNet * s.offers
  }
  return {
    offers,
    tension: offers ? Math.round(tensionWeighted / offers) : 0,
    salaryNet: offers ? Math.round(salaryWeighted / offers) : 0,
  }
}

/**
 * Dynamisme économique ramené au secteur actif, pour que le panneau reste
 * cohérent avec le métier sélectionné. Pour « all », on garde le dynamisme
 * global de la ville. Pour un secteur, on combine le dynamisme de la ville,
 * le poids du secteur dans la ville et sa tension.
 */
export function sectorDynamism(city: City, category: ActiveCategory): number {
  if (category === 'all') return city.dynamism
  const offers = CATEGORY_KEYS.map((k) => city.jobsByCategory[k].offers)
  const maxOffers = Math.max(...offers)
  const s = city.jobsByCategory[category]
  const ratio = maxOffers ? s.offers / maxOffers : 0
  const value = 0.5 * city.dynamism + 30 * ratio + 0.2 * s.tension
  return Math.min(100, Math.max(0, Math.round(value)))
}

/** Score de travaillabilité sur 100 pour le métier actif. */
export function computeScore(city: City, category: ActiveCategory): number {
  const s = statsFor(city, category)
  const offers = normalizeOffers(s.offers, category)
  const tension = clamp01(s.tension / 100)
  const salary = normalizeLinear(s.salaryNet, REF.salaryMin, REF.salaryMax)
  // Logement : plus c'est cher, moins c'est favorable → on inverse.
  const housing = 1 - normalizeLinear(city.housingPricePerM2, REF.housingMin, REF.housingMax)

  const score =
    SCORE_WEIGHTS.offers * offers +
    SCORE_WEIGHTS.tension * tension +
    SCORE_WEIGHTS.salary * salary +
    SCORE_WEIGHTS.housing * housing

  return Math.round(score * 100)
}

const BANDS: Record<ScoreBandKey, ScoreBand> = {
  'tres-forte': {
    key: 'tres-forte',
    label: 'Très favorable',
    color: '#15803D',
    description: 'Marché très favorable',
  },
  bonne: {
    key: 'bonne',
    label: 'Favorable',
    color: '#5BBF73',
    description: 'Bonnes opportunités',
  },
  moyenne: {
    key: 'moyenne',
    label: 'Équilibré',
    color: '#E0A82E',
    description: 'Marché équilibré',
  },
  faible: {
    key: 'faible',
    label: 'Défavorable',
    color: '#EA7A2C',
    description: 'Marché tendu',
  },
  difficile: {
    key: 'difficile',
    label: 'Très difficile',
    color: '#D6492F',
    description: 'Marché difficile',
  },
}

export const SCORE_BANDS: ScoreBand[] = [
  BANDS['tres-forte'],
  BANDS.bonne,
  BANDS.moyenne,
  BANDS.faible,
  BANDS.difficile,
]

export function scoreBand(score: number): ScoreBand {
  if (score >= 70) return BANDS['tres-forte']
  if (score >= 60) return BANDS.bonne
  if (score >= 50) return BANDS.moyenne
  if (score >= 40) return BANDS.faible
  return BANDS.difficile
}

export function tensionLevel(tension: number): TensionLevel {
  if (tension >= 75) return { key: 'tres-elevee', label: 'Très élevée' }
  if (tension >= 65) return { key: 'elevee', label: 'Élevée' }
  if (tension >= 50) return { key: 'moderee', label: 'Modérée' }
  return { key: 'faible', label: 'Faible' }
}

/** Rayon de la zone (mètres) selon le volume d'offres du métier actif. */
export function circleRadius(city: City, category: ActiveCategory): number {
  const weight = normalizeOffers(statsFor(city, category).offers, category)
  return Math.round(16_000 + weight * 44_000)
}

/** Recommandation automatique en une phrase, dérivée des indicateurs du métier actif. */
export function buildRecommendation(
  city: City,
  score: number,
  stats: CategoryStats,
  category: ActiveCategory,
): string {
  const parts: string[] = []
  const secteur = category === 'all' ? '' : ` en ${categoryLabel(category)}`

  if (score >= 70) parts.push(`Marché de l'emploi très favorable${secteur}.`)
  else if (score >= 60) parts.push(`Bon marché de l'emploi${secteur}.`)
  else if (score >= 50) parts.push(`Marché de l'emploi correct mais sélectif${secteur}.`)
  else if (score >= 40) parts.push(`Marché de l'emploi plus tendu${secteur}.`)
  else parts.push(`Marché de l'emploi difficile${secteur}.`)

  if (stats.tension >= 74) parts.push('Forte demande de recrutement : bon endroit pour trouver vite.')
  else if (stats.tension <= 52) parts.push('Concurrence plus marquée entre les candidats.')

  if (city.housingPricePerM2 <= 3_200) parts.push('Coût du logement raisonnable.')
  else if (city.housingPricePerM2 >= 6_000) parts.push('Coût du logement élevé à anticiper.')

  if (stats.salaryNet >= 2_500) parts.push('Salaires du secteur parmi les plus élevés.')
  if (city.dynamism >= 85) parts.push('Tissu économique très dynamique.')

  return parts.join(' ')
}

/** Transforme une ville brute en ville enrichie pour la catégorie active. */
export function enrichCity(city: City, category: ActiveCategory): EnrichedCity {
  const stats = statsFor(city, category)
  const score = computeScore(city, category)
  return {
    ...city,
    category,
    offers: stats.offers,
    tension: stats.tension,
    salaryNet: stats.salaryNet,
    // Dynamisme recalculé pour le secteur actif (cohérence du panneau).
    dynamism: sectorDynamism(city, category),
    score,
    band: scoreBand(score),
    tensionLevel: tensionLevel(stats.tension),
    radiusMeters: circleRadius(city, category),
    recommendation: buildRecommendation(city, score, stats, category),
  }
}

export function enrichCities(cities: City[], category: ActiveCategory): EnrichedCity[] {
  return cities.map((c) => enrichCity(c, category))
}
