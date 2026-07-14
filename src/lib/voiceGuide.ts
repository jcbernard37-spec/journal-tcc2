/**
 * Guide vocal — Web Speech API
 * Fonctionne dans Chrome, Safari, Firefox sans aucune clé API.
 * Voix française, rythme lent et apaisant.
 */

type SegmentVoix = {
  texte: string;
  pause?: number; // millisecondes avant le prochain segment
};

let utteranceCourante: SpeechSynthesisUtterance | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let segmentsRestants: SegmentVoix[] = [];
let enPause = false;

/** Trouve la meilleure voix française disponible */
function trouverVoixFr(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Priorité : voix fr-FR natives, puis fr-*, puis toute voix fr
  return (
    voices.find(v => v.lang === 'fr-FR' && !v.name.includes('Google')) ||
    voices.find(v => v.lang === 'fr-FR') ||
    voices.find(v => v.lang.startsWith('fr')) ||
    null
  );
}

/** Lit un segment de texte */
function lireSegment(
  segment: SegmentVoix,
  onFin?: () => void
): void {
  if (enPause) return;

  const utterance = new SpeechSynthesisUtterance(segment.texte);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.82;   // légèrement ralenti, apaisant
  utterance.pitch = 0.95;  // légèrement grave, chaleureux
  utterance.volume = 1.0;

  // Voix française si disponible
  const voix = trouverVoixFr();
  if (voix) utterance.voice = voix;

  utterance.onend = () => {
    if (onFin) onFin();
  };

  utteranceCourante = utterance;
  window.speechSynthesis.speak(utterance);
}

/** Joue une séquence de segments avec pauses */
export function jouerScriptGuidé(
  segments: SegmentVoix[],
  onProgression?: (index: number, total: number) => void,
  onFin?: () => void
): void {
  arreter();
  enPause = false;
  segmentsRestants = [...segments];

  const total = segments.length;
  let index = 0;

  function jouerSuivant(): void {
    if (enPause || index >= segmentsRestants.length) {
      if (index >= segmentsRestants.length && onFin) onFin();
      return;
    }

    const segment = segmentsRestants[index];
    if (onProgression) onProgression(index, total);
    index++;

    lireSegment(segment, () => {
      const pause = segment.pause ?? 1200;
      timeoutId = setTimeout(jouerSuivant, pause);
    });
  }

  // Attendre que les voix soient chargées
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      jouerSuivant();
    };
  } else {
    jouerSuivant();
  }
}

/** Met en pause */
export function mettreEnPause(): void {
  enPause = true;
  window.speechSynthesis.pause();
  if (timeoutId) clearTimeout(timeoutId);
}

/** Reprend */
export function reprendre(): void {
  enPause = false;
  window.speechSynthesis.resume();
}

/** Arrête tout */
export function arreter(): void {
  enPause = false;
  window.speechSynthesis.cancel();
  if (timeoutId) clearTimeout(timeoutId);
  utteranceCourante = null;
  segmentsRestants = [];
}

export function estEnCours(): boolean {
  return window.speechSynthesis.speaking && !enPause;
}

export function estEnPause(): boolean {
  return enPause;
}
