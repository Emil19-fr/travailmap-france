// Types métier de TravailMap France.

/** Catégories de métiers couvertes par l'application. */
export type CategoryKey =
  | 'it'
  | 'sante'
  | 'btp'
  | 'commerce'
  | 'logistique'
  | 'industrie'
  | 'services'

/** Catégorie active : un métier précis, ou l'agrégat « tous métiers ». */
export type ActiveCategory = CategoryKey | 'all'

/** Indicateurs d'un secteur dans une ville. */
export interface CategoryStats {
  /** Nombre d'offres d'emploi actives dans le secteur. */
  offers: number
  /** Tension de recrutement 0–100 (plus élevé = favorable au candidat). */
  tension: number
  /** Salaire net mensuel moyen estimé du secteur, en euros. */
  salaryNet: number
}

/** Donnée brute d'une ville (ce qu'on remplacerait par de vraies API). */
export interface City {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  /** Indicateurs d'emploi par catégorie de métier. */
  jobsByCategory: Record<CategoryKey, CategoryStats>
  /** Prix moyen à l'achat du logement, en euros / m². */
  housingPricePerM2: number
  /** Dynamisme économique estimé 0–100 (créations d'entreprises, croissance). */
  dynamism: number
}

export type ScoreBandKey = 'tres-forte' | 'bonne' | 'moyenne' | 'faible' | 'difficile'

export interface ScoreBand {
  key: ScoreBandKey
  label: string
  color: string
  description: string
}

export type TensionKey = 'faible' | 'moderee' | 'elevee' | 'tres-elevee'

export interface TensionLevel {
  key: TensionKey
  label: string
}

/**
 * Ville enrichie pour une catégorie active : score et indicateurs « à plat »
 * (offers / tension / salaryNet correspondent au métier sélectionné).
 */
export interface EnrichedCity extends City {
  category: ActiveCategory
  offers: number
  tension: number
  salaryNet: number
  score: number
  band: ScoreBand
  tensionLevel: TensionLevel
  radiusMeters: number
  recommendation: string
}
