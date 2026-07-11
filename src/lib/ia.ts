// ═══════════════════════════════════════════════════════
// SERVICE IA — appelle la fonction serveur /api/feedback
// (la clé API reste côté serveur, jamais ici)
// ═══════════════════════════════════════════════════════

// En développement local, l'API Vercel n'existe pas.
// On détecte et on prévient l'utilisateur.
const EST_LOCAL = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

import { enregistrerTokens } from './budget';

export type TypeIA = 'feedback_bec' | 'feedback_arbre' | 'feedback_parking' | 'feedback_predictions' | 'feedback_schemas' | 'feedback_comportements' | 'feedback_decatastrophisation' | 'synthese' | 'psychoeducation' | 'compagnon';

export interface MessageChat {
  role: 'user' | 'assistant';
  content: string;
}

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
    
    // Enregistre la consommation de tokens
    if (data.tokens) {
      enregistrerTokens(data.tokens);
    }
    
    return { ok: true, texte: data.reponse || '' };
  } catch {
    return { ok: false, texte: 'Impossible de joindre l\'IA. Vérifie ta connexion.' };
  }
}

// ── Conversation avec le compagnon (garde l'historique) ──
export async function converserAvecCompagnon(messages: MessageChat[]): Promise<{ ok: boolean; texte: string }> {
  if (EST_LOCAL) {
    return {
      ok: false,
      texte: 'L\'assistant fonctionne uniquement sur la version en ligne (journal-tcc2.vercel.app).',
    };
  }

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'compagnon', messages }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { ok: false, texte: err.error || 'Une erreur est survenue. Réessaie dans un instant.' };
    }

    const data = await response.json();
    
    // Enregistre la consommation de tokens
    if (data.tokens) {
      enregistrerTokens(data.tokens);
    }
    
    return { ok: true, texte: data.reponse || '' };
  } catch {
    return { ok: false, texte: 'Impossible de joindre l\'assistant. Vérifie ta connexion.' };
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
