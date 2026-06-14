// Table de correspondance pour garantir des noms français dans toute l'UI.
// Sert de filet de sécurité : si une source/API renvoie un libellé anglais
// (ex. « Island of France »), on le remappe vers le nom français officiel.
// Si aucune correspondance n'est trouvée, la valeur d'origine est conservée.

const REGION_FR: Record<string, string> = {
  'island of france': 'Île-de-France',
  'ile-de-france': 'Île-de-France',
  brittany: 'Bretagne',
  normandy: 'Normandie',
  corsica: 'Corse',
  occitania: 'Occitanie',
  'new aquitaine': 'Nouvelle-Aquitaine',
  'upper france': 'Hauts-de-France',
  'loire country': 'Pays de la Loire',
  'great east': 'Grand Est',
  'grand est': 'Grand Est',
  burgundy: 'Bourgogne-Franche-Comté',
  'burgundy-franche-comte': 'Bourgogne-Franche-Comté',
  'free county': 'Bourgogne-Franche-Comté',
  'centre-loire valley': 'Centre-Val de Loire',
  'loire valley': 'Centre-Val de Loire',
  'auvergne-rhone-alpes': 'Auvergne-Rhône-Alpes',
  "provence-alpes-cote d'azur": "Provence-Alpes-Côte d'Azur",
  provence: "Provence-Alpes-Côte d'Azur",
}

const PLACE_FR: Record<string, string> = {
  lyons: 'Lyon',
  marseilles: 'Marseille',
  rheims: 'Reims',
  dunkirk: 'Dunkerque',
}

/** Normalise une clé : sans accents, minuscules, espaces réduits. */
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

function translate(value: string, table: Record<string, string>): string {
  if (!value) return value
  return table[norm(value)] ?? value
}

/** Renvoie le nom de région en français (ou la valeur d'origine si déjà FR/inconnue). */
export const toFrenchRegion = (region: string): string => translate(region, REGION_FR)

/** Renvoie le nom de lieu/ville en français (gère quelques exonymes anglais). */
export const toFrenchPlace = (name: string): string => translate(name, PLACE_FR)
