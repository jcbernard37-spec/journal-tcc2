/**
 * Hook de génération de session IA
 * Charge le profil, l'anamnèse, l'analyse et génère un script unique
 */

import type { Segment } from '../data/scriptsTherapeutiques';
import { getProfil } from './profilPersonnel';
import { personnaliserScript } from './genreAdapteur';

interface ContexteSession {
  outil: string;
  dureeMin: number;
  etatJour?: string; // "comment tu te sens aujourd'hui ?"
}

interface ResultatGeneration {
  segments: Segment[];
  source: 'ia' | 'fallback';
  erreur?: string;
}

/** Charge toutes les données nécessaires depuis localStorage */
function chargerContexte() {
  const profil    = getProfil();
  const anamnese  = JSON.parse(localStorage.getItem('tcc_anamnese') || 'null');
  const analyse   = JSON.parse(localStorage.getItem('solco_analyse_ia') || 'null');
  return { profil, anamnese, analyse };
}

/**
 * Génère un script IA personnalisé pour cette session
 * @param outil - identifiant de l'outil (yoga_nidra, hypnose_relaxation, etc.)
 * @param dureeMin - durée cible en minutes
 * @param fallback - script de secours si l'IA échoue
 * @param etatJour - comment la personne se sent aujourd'hui (optionnel)
 */
export async function genererSession(
  outil: string,
  dureeMin: number,
  fallback: Segment[],
  etatJour?: string
): Promise<ResultatGeneration> {
  const { profil, anamnese, analyse } = chargerContexte();

  // Si pas de profil, retourner le fallback avec adaptation de genre si possible
  if (!profil) {
    return { segments: fallback, source: 'fallback', erreur: 'Profil non renseigné' };
  }

  try {
    const response = await fetch('/api/generate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outil,
        dureeMin,
        profil,
        anamnese,
        analyse,
        etatJour,
        genre: profil.genre,
        age: profil.age,
        prenom: profil.prenom,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.segments)) throw new Error('Réponse invalide');

    return { segments: data.segments, source: 'ia' };
  } catch (err) {
    // Fallback avec adaptation de genre
    const segmentsAdaptes = personnaliserScript(
      fallback,
      profil.genre,
      profil.prenom
    );
    return {
      segments: segmentsAdaptes,
      source: 'fallback',
      erreur: (err as Error).message,
    };
  }
}

/** Vérifie si la génération IA est disponible */
export function iaDisponible(): boolean {
  const profil = getProfil();
  return !!(profil?.prenom && profil?.genre !== 'N');
}
