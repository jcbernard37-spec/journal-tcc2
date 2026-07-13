// ═══════════════════════════════════════════════════════
// PARCOURS INTELLIGENT — Mappe les schémas aux feuilles et génère un bilan expliqué
// ═══════════════════════════════════════════════════════

import { SCHEMAS } from '../data/tcc';

// Chaque schéma est relié aux feuilles pertinentes
const SCHEMA_TO_FEUILLES: Record<string, { slug: string; raison: string }[]> = {
  // Séparation & rejet
  abandon: [
    { slug: 'schemas', raison: 'Pour comprendre ce schéma de fond' },
    { slug: 'comportements-securite', raison: 'Tu cherches à te rassurer que l\'autre ne partira pas' },
    { slug: 'arbre', raison: 'Pour décider si c\'est à toi d\'agir ou de lâcher prise' },
  ],
  mefiance: [
    { slug: 'schemas', raison: 'Pour explorer cette méfiance envers les autres' },
    { slug: 'bec', raison: 'Pour décortiquer les pensées qui te disent qu\'on va te trahir' },
  ],
  manque_affectif: [
    { slug: 'schemas', raison: 'Pour accueillir ce vide affectif' },
    { slug: 'parking', raison: 'Pour poser les inquiétudes autour de ce besoin non comblé' },
  ],
  imperfection: [
    { slug: 'schemas', raison: 'Pour travailler sur la honte et l\'autocritique' },
    { slug: 'bec', raison: 'Pour questionner les pensées « il y a quelque chose qui cloche chez moi »' },
  ],
  isolement: [
    { slug: 'schemas', raison: 'Pour comprendre ce sentiment d\'être à l\'écart' },
    { slug: 'parking', raison: 'Pour poser les ruminations autour du sentiment d\'exclusion' },
  ],

  // Manque d'autonomie
  dependance: [
    { slug: 'schemas', raison: 'Pour explorer ce besoin d\'approbation ou de validation' },
    { slug: 'bec', raison: 'Pour questionner « je ne peux pas le faire seul »' },
    { slug: 'arbre', raison: 'Pour apprendre à décider par toi-même' },
  ],
  vulnerabilite: [
    { slug: 'predictions', raison: 'Pour tester tes prédictions catastrophe' },
    { slug: 'decatastrophisation', raison: 'Pour déplier le pire scénario calmement' },
    { slug: 'comportements-securite', raison: 'Pour repérer tes comportements d\'évitement' },
  ],
  fusion: [
    { slug: 'schemas', raison: 'Pour explorer cette fusion avec l\'autre' },
    { slug: 'arbre', raison: 'Pour différencier ce qui est à toi et ce qui ne l\'est pas' },
  ],
  echec: [
    { slug: 'schemas', raison: 'Pour travailler sur ce sentiment d\'incompétence' },
    { slug: 'bec', raison: 'Pour questionner « je vais échouer »' },
    { slug: 'predictions', raison: 'Pour tester tes anticipations d\'échec' },
  ],

  // Manque de limites
  grandiosite: [
    { slug: 'schemas', raison: 'Pour explorer ce sentiment d\'être au-dessus des règles' },
    { slug: 'bec', raison: 'Pour regarder les pensées qui te disent « c\'est injuste »' },
  ],
  autocontrole: [
    { slug: 'comportements-securite', raison: 'Pour repérer les impulsions et ce qui les déclenche' },
    { slug: 'arbre', raison: 'Pour réfléchir à ce qu\'il y a à changer ou à accepter' },
  ],

  // Orientation vers les autres
  assujettissement: [
    { slug: 'schemas', raison: 'Pour explorer ce schéma du « je dois faire ce qu\'on attend »' },
    { slug: 'arbre', raison: 'Pour apprendre à dire non et à décider par toi-même' },
  ],
  sacrifice: [
    { slug: 'schemas', raison: 'C\'est le cœur de ton travail : ton schéma de sauveur' },
    { slug: 'comportements-securite', raison: 'Pour repérer le dévouement au point de t\'épuiser' },
    { slug: 'bec', raison: 'Pour décortiquer les pensées « mes besoins ne comptent pas »' },
    { slug: 'arbre', raison: 'Pour décider jusqu\'où t\'impliquer sans te perdre' },
  ],
  approbation: [
    { slug: 'schemas', raison: 'Pour explorer ce besoin de plaire' },
    { slug: 'bec', raison: 'Pour questionner les pensées « ils vont mal me juger »' },
  ],

  // Survigilance & inhibition
  negativite: [
    { slug: 'parking', raison: 'Pour poser les ruminations pessimistes' },
    { slug: 'predictions', raison: 'Pour tester tes prédictions négatives' },
  ],
  surcontrole: [
    { slug: 'schemas', raison: 'Pour explorer ce besoin de tout contrôler' },
    { slug: 'comportements-securite', raison: 'Pour repérer comment tu te retiens' },
  ],
  ideaux: [
    { slug: 'schemas', raison: 'Pour travailler sur le perfectionnisme' },
    { slug: 'bec', raison: 'Pour questionner « je dois être parfait »' },
  ],
  punition: [
    { slug: 'schemas', raison: 'Pour explorer cette intolérance à l\'erreur' },
    { slug: 'bec', raison: 'Pour accueillir l\'erreur comme normale' },
  ],
};

// Déduplique et ordonne les feuilles recommandées
export function genererParcours(schemasIds: string[]): { slug: string; raisons: string[] }[] {
  const feuilles: Record<string, Set<string>> = {};

  schemasIds.forEach(id => {
    const recos = SCHEMA_TO_FEUILLES[id];
    if (recos) {
      recos.forEach(({ slug, raison }) => {
        if (!feuilles[slug]) feuilles[slug] = new Set();
        feuilles[slug].add(raison);
      });
    }
  });

  // Ordonne par fréquence (les feuilles utiles pour plusieurs schémas viennent en premier)
  return Object.entries(feuilles)
    .map(([slug, raisons]) => ({ slug, raisons: Array.from(raisons) }))
    .sort((a, b) => b.raisons.length - a.raisons.length);
}

// Génère un message expliqué via l'IA
export async function genererBilanExplique(prenom: string, schemasIds: string[], gad7Score: number): Promise<string> {
  const parcours = genererParcours(schemasIds);
  const schemaLabels = schemasIds.map((id: string) => SCHEMAS.find(s => s.id === id)?.nom).filter(Boolean).join(', ');

  const prompt = `Tu es un compagnon TCC qui accueille une personne au début de son parcours.

Elle s'appelle ${prenom}. Elle vient de remplir un bilan d'anxiété (GAD-7 = ${gad7Score}/21) et a identifié ses schémas de fond : ${schemaLabels}.

Écris-lui un message court, chaleureux et encourageant qui :
1. ACCUEILLE ce qu'elle a identifié (son anxiété, ses schémas)
2. EXPLIQUE brièvement les liens entre ses schémas et le travail qu'elle peut faire
3. L'ORIENTE vers les feuilles qui correspondent, pas juste une liste mais une logique ("commence par X parce que... ensuite Y pour...")
4. La RASSURE que ce n'est pas du tout-ou-rien : elle peut avancer à son rythme, passer d'une feuille à l'autre

Ton : doux, humain, tutoiement, pas de jargon. Maximum 250 mots. Termine en lui souhaitant bon courage.`;

  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'compagnon', messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    return `Bienvenue ${prenom}. Tu as bien travaillé sur ce bilan — c'est le premier pas. Tes schémas dominants sont ${schemaLabels}. Commence par explorer la feuille « Mes schémas profonds » pour approfondir, puis laisse-toi guider.`;
  }

  const data = await response.json();
  return data.reponse || '';
}
