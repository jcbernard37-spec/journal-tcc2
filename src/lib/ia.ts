// ═══════════════════════════════════════════════════════
// SERVICE IA — appelle la fonction serveur /api/feedback
// (la clé API reste côté serveur, jamais ici)
// ═══════════════════════════════════════════════════════

// En développement local, l'API Vercel n'existe pas.
// On détecte et on prévient l'utilisateur.
const EST_LOCAL = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export type TypeIA = 'feedback_bec' | 'synthese' | 'psychoeducation';

export async function demanderIA(type: TypeIA, contenu: string): Promise<{ ok: boolean; texte: string }> {
  if (EST_LOCAL) {
    return {
      ok: false,
      texte: 'Le retour de l\'IA fonctionne uniquement sur la version en ligne (journal-tcc2.vercel.app), pas en local. Déploie ou ouvre l\'app en ligne pour l\'utiliser.',
    };
  }

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, contenu }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { ok: false, texte: err.error || 'Une erreur est survenue. Réessaie dans un instant.' };
    }

    const data = await response.json();
    return { ok: true, texte: data.reponse || '' };
  } catch {
    return { ok: false, texte: 'Impossible de joindre l\'IA. Vérifie ta connexion.' };
  }
}

// ── Construit le texte à envoyer pour un feedback BEC ──
export function construireContenuBEC(valeurs: Record<string, unknown>): string {
  const parts: string[] = [];
  if (valeurs.situation) parts.push(`Situation : ${valeurs.situation}`);
  if (Array.isArray(valeurs.emotions) && valeurs.emotions.length) parts.push(`Émotions : ${valeurs.emotions.join(', ')}`);
  if (valeurs.intensite != null) parts.push(`Intensité de départ : ${valeurs.intensite}/100`);
  if (valeurs.pensee_auto) parts.push(`Pensée automatique : ${valeurs.pensee_auto}`);
  if (Array.isArray(valeurs.distorsions) && valeurs.distorsions.length) parts.push(`Distorsions repérées : ${valeurs.distorsions.join(', ')}`);
  if (valeurs.pensee_alternative) parts.push(`Pensée alternative proposée : ${valeurs.pensee_alternative}`);
  if (valeurs.intensite_apres != null) parts.push(`Intensité après : ${valeurs.intensite_apres}/100`);

  return `Voici ma feuille de journal de pensées (tableau BEC). Aide-moi avec quelques questions socratiques.\n\n${parts.join('\n')}`;
}
