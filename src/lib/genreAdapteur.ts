/**
 * Adaptation grammaticale des scripts selon le genre
 *
 * Dans les scripts, les marqueurs suivants sont utilisés :
 *   [e]       → 'e' (F) ou '' (M)     → allongé[e], détendu[e]
 *   [ée|é]    → 'ée' (F) ou 'é' (M)  → libéré[ée|é]
 *   [elle|il] → 'elle' ou 'il'
 *   [la|le]   → 'la' ou 'le'
 *   [une|un]  → 'une' ou 'un'
 *   [ma|mon]  → 'ma' ou 'mon'
 *   [tu es|tu es] → identique mais pour forcer relecture
 */

import type { Genre } from './profilPersonnel';
import type { Segment } from '../data/scriptsTherapeutiques';

export function adapterGenre(texte: string, genre: Genre): string {
  if (genre === 'F') {
    return texte
      .replace(/\[e\]/g, 'e')
      .replace(/\[ée\|é\]/g, 'ée')
      .replace(/\[elle\|il\]/g, 'elle')
      .replace(/\[la\|le\]/g, 'la')
      .replace(/\[une\|un\]/g, 'une')
      .replace(/\[ma\|mon\]/g, 'ma')
      .replace(/\[ses\|ses\]/g, 'ses')
      .replace(/\[celle\|celui\]/g, 'celle');
  } else {
    // Masculin ou neutre → forme masculine par défaut
    return texte
      .replace(/\[e\]/g, '')
      .replace(/\[ée\|é\]/g, 'é')
      .replace(/\[elle\|il\]/g, 'il')
      .replace(/\[la\|le\]/g, 'le')
      .replace(/\[une\|un\]/g, 'un')
      .replace(/\[ma\|mon\]/g, 'mon')
      .replace(/\[ses\|ses\]/g, 'ses')
      .replace(/\[celle\|celui\]/g, 'celui');
  }
}

/** Adapte tous les segments d'un script */
export function adapterScriptGenre(segments: Segment[], genre: Genre): Segment[] {
  return segments.map(seg => ({
    ...seg,
    texte: adapterGenre(seg.texte, genre),
  }));
}

/** Remplace {PRENOM} par le vrai prénom dans le script */
export function injecterPrenom(segments: Segment[], prenom: string): Segment[] {
  return segments.map(seg => ({
    ...seg,
    texte: seg.texte.replace(/\{PRENOM\}/g, prenom),
  }));
}

/** Applique genre + prénom d'un coup */
export function personnaliserScript(
  segments: Segment[],
  genre: Genre,
  prenom?: string
): Segment[] {
  let result = adapterScriptGenre(segments, genre);
  if (prenom) result = injecterPrenom(result, prenom);
  return result;
}
