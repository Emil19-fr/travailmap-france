import type { CategoryKey, CategoryStats, City } from '../types/city'
import { CATEGORY_KEYS } from './categories'
import { toFrenchPlace, toFrenchRegion } from '../lib/frenchNames'

/**
 * Données simulées réalistes (ordres de grandeur, ~2026) — DÉMONSTRATION.
 *
 * Chaque ville expose `jobsByCategory` (offres / tension / salaire par secteur),
 * généré ci-dessous à partir d'un profil de ville et d'un profil de secteur.
 * On garde une génération paramétrée plutôt que 15 × 7 × 3 valeurs en dur :
 * c'est plus lisible et plus simple à faire évoluer.
 *
 * 👉 POUR BRANCHER LE RÉEL, remplacer cette génération par des appels API et
 *    fournir directement `jobsByCategory` par ville (le reste ne change pas) :
 *   • France Travail — offres + métiers en tension par secteur (ROME)  · https://francetravail.io
 *   • INSEE          — salaires par secteur, chômage, population        · https://api.insee.fr
 *   • Data.gouv.fr   — prix logement (DVF), créations d'entreprises     · https://www.data.gouv.fr
 */

/** Profil global d'un secteur : part des offres, salaire de base, tension de base. */
interface SectorProfile {
  share: number
  salaryBase: number
  tensionBase: number
}

const SECTOR_PROFILES: Record<CategoryKey, SectorProfile> = {
  it: { share: 0.12, salaryBase: 2500, tensionBase: 80 },
  sante: { share: 0.18, salaryBase: 2050, tensionBase: 85 },
  btp: { share: 0.13, salaryBase: 1950, tensionBase: 78 },
  commerce: { share: 0.2, salaryBase: 1800, tensionBase: 54 },
  logistique: { share: 0.12, salaryBase: 1900, tensionBase: 68 },
  industrie: { share: 0.13, salaryBase: 2150, tensionBase: 62 },
  services: { share: 0.12, salaryBase: 1900, tensionBase: 57 },
}

/** Profil d'une ville avant expansion par secteur. */
interface CityBase {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  /** Volume total d'offres tous secteurs confondus. */
  jobsBase: number
  /** Multiplicateur de salaire local (niveau de vie / tension salariale). */
  salaryFactor: number
  /** Décalage de tension propre à la ville (dynamisme local). */
  tensionAdj: number
  housingPricePerM2: number
  dynamism: number
  /** Sur/sous-représentation de certains secteurs (1 = neutre). */
  bias?: Partial<Record<CategoryKey, number>>
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function build(base: CityBase): City {
  const jobsByCategory = {} as Record<CategoryKey, CategoryStats>
  for (const key of CATEGORY_KEYS) {
    const p = SECTOR_PROFILES[key]
    const bias = base.bias?.[key] ?? 1
    jobsByCategory[key] = {
      offers: Math.round(base.jobsBase * p.share * bias),
      tension: clamp(Math.round(p.tensionBase + base.tensionAdj), 0, 100),
      salaryNet: Math.round((p.salaryBase * base.salaryFactor) / 10) * 10,
    }
  }
  return {
    id: base.id,
    name: toFrenchPlace(base.name),
    region: toFrenchRegion(base.region),
    lat: base.lat,
    lng: base.lng,
    jobsByCategory,
    housingPricePerM2: base.housingPricePerM2,
    dynamism: base.dynamism,
  }
}

const BASES: CityBase[] = [
  { id: 'paris', name: 'Paris', region: 'Île-de-France', lat: 48.8566, lng: 2.3522, jobsBase: 180000, salaryFactor: 1.18, tensionAdj: 2, housingPricePerM2: 9800, dynamism: 92, bias: { it: 1.5, services: 1.4, commerce: 1.1, industrie: 0.6, btp: 0.8 } },
  { id: 'lyon', name: 'Lyon', region: 'Auvergne-Rhône-Alpes', lat: 45.764, lng: 4.8357, jobsBase: 62000, salaryFactor: 1.05, tensionAdj: 4, housingPricePerM2: 5200, dynamism: 88, bias: { it: 1.3, industrie: 1.2, sante: 1.1 } },
  { id: 'marseille', name: 'Marseille', region: "Provence-Alpes-Côte d'Azur", lat: 43.2965, lng: 5.3698, jobsBase: 38000, salaryFactor: 0.97, tensionAdj: -8, housingPricePerM2: 3400, dynamism: 68, bias: { logistique: 1.4, commerce: 1.1, industrie: 1.1, it: 0.8 } },
  { id: 'toulouse', name: 'Toulouse', region: 'Occitanie', lat: 43.6047, lng: 1.4442, jobsBase: 41000, salaryFactor: 1.04, tensionAdj: 6, housingPricePerM2: 3700, dynamism: 87, bias: { it: 1.4, industrie: 1.6, services: 1.0 } },
  { id: 'bordeaux', name: 'Bordeaux', region: 'Nouvelle-Aquitaine', lat: 44.8378, lng: -0.5792, jobsBase: 34000, salaryFactor: 1.0, tensionAdj: 2, housingPricePerM2: 4900, dynamism: 83, bias: { commerce: 1.2, services: 1.1, it: 1.1, btp: 1.1 } },
  { id: 'lille', name: 'Lille', region: 'Hauts-de-France', lat: 50.6292, lng: 3.0573, jobsBase: 33000, salaryFactor: 0.96, tensionAdj: -2, housingPricePerM2: 3300, dynamism: 75, bias: { logistique: 1.5, commerce: 1.3, services: 1.1, it: 0.9 } },
  { id: 'nantes', name: 'Nantes', region: 'Pays de la Loire', lat: 47.2184, lng: -1.5536, jobsBase: 36000, salaryFactor: 1.02, tensionAdj: 8, housingPricePerM2: 4100, dynamism: 89, bias: { it: 1.3, sante: 1.1, industrie: 1.1 } },
  { id: 'montpellier', name: 'Montpellier', region: 'Occitanie', lat: 43.6108, lng: 3.8767, jobsBase: 24000, salaryFactor: 0.98, tensionAdj: -6, housingPricePerM2: 3500, dynamism: 78, bias: { sante: 1.3, it: 1.1, commerce: 1.1, industrie: 0.7 } },
  { id: 'strasbourg', name: 'Strasbourg', region: 'Grand Est', lat: 48.5734, lng: 7.7521, jobsBase: 22000, salaryFactor: 1.0, tensionAdj: 2, housingPricePerM2: 3300, dynamism: 76, bias: { industrie: 1.2, sante: 1.1 } },
  { id: 'rennes', name: 'Rennes', region: 'Bretagne', lat: 48.1173, lng: -1.6778, jobsBase: 26000, salaryFactor: 1.01, tensionAdj: 9, housingPricePerM2: 3900, dynamism: 86, bias: { it: 1.4, sante: 1.1, industrie: 1.0 } },
  { id: 'nice', name: 'Nice', region: "Provence-Alpes-Côte d'Azur", lat: 43.7102, lng: 7.262, jobsBase: 21000, salaryFactor: 0.99, tensionAdj: -8, housingPricePerM2: 5000, dynamism: 70, bias: { commerce: 1.3, services: 1.3, sante: 1.1, industrie: 0.6, it: 0.8 } },
  { id: 'grenoble', name: 'Grenoble', region: 'Auvergne-Rhône-Alpes', lat: 45.1885, lng: 5.7245, jobsBase: 23000, salaryFactor: 1.03, tensionAdj: 6, housingPricePerM2: 3200, dynamism: 84, bias: { it: 1.4, industrie: 1.5, sante: 1.0 } },
  { id: 'reims', name: 'Reims', region: 'Grand Est', lat: 49.2583, lng: 4.0317, jobsBase: 12000, salaryFactor: 0.95, tensionAdj: -2, housingPricePerM2: 2600, dynamism: 67, bias: { industrie: 1.2, commerce: 1.1, logistique: 1.1 } },
  { id: 'dijon', name: 'Dijon', region: 'Bourgogne-Franche-Comté', lat: 47.322, lng: 5.0415, jobsBase: 13000, salaryFactor: 0.97, tensionAdj: 0, housingPricePerM2: 2700, dynamism: 69, bias: { sante: 1.1, industrie: 1.1 } },
  { id: 'clermont-ferrand', name: 'Clermont-Ferrand', region: 'Auvergne-Rhône-Alpes', lat: 45.7772, lng: 3.087, jobsBase: 14000, salaryFactor: 0.98, tensionAdj: 2, housingPricePerM2: 2500, dynamism: 72, bias: { industrie: 1.5, sante: 1.0 } },
]

export const CITIES: City[] = BASES.map(build)
