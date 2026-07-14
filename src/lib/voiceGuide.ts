/**
 * voiceGuide.ts — Web Speech API, compatible iOS + Android
 *
 * Fix iOS critique : la première utterance DOIT être lancée
 * dans le même call stack qu'un geste utilisateur.
 * Solution : on appelle speak() immédiatement dans jouerScriptGuidé,
 * sans aucun setTimeout avant le premier segment.
 */

export type Segment = { texte: string; pause?: number };

let _idx    = 0;
let _segs:  Segment[] = [];
let _timer: ReturnType<typeof setTimeout> | null = null;
let _paused = false;
let _onProg: ((i: number, t: number) => void) | undefined;
let _onFin:  (() => void)                    | undefined;

/** Trouve la meilleure voix française disponible */
function voixFr(): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  return (
    all.find(v => v.lang === 'fr-FR' && v.localService) ||
    all.find(v => v.lang === 'fr-FR')                   ||
    all.find(v => v.lang.startsWith('fr'))              ||
    null
  );
}

function lireSeg(seg: Segment) {
  if (_paused) return;

  const u    = new SpeechSynthesisUtterance(seg.texte);
  u.lang     = 'fr-FR';
  u.rate     = 0.82;
  u.pitch    = 0.95;
  u.volume   = 1.0;
  const v    = voixFr();
  if (v) u.voice = v;

  u.onend = () => {
    _idx++;
    if (_onProg) _onProg(_idx, _segs.length);
    if (_idx >= _segs.length) { if (_onFin) _onFin(); return; }
    _timer = setTimeout(() => lireSeg(_segs[_idx]), _segs[_idx - 1].pause ?? 1200);
  };

  u.onerror = (e) => {
    // Ignore 'interrupted' (normal quand on appelle cancel/stop)
    if ((e as any).error === 'interrupted') return;
    // Sur erreur, on passe au segment suivant
    _idx++;
    if (_idx < _segs.length) {
      _timer = setTimeout(() => lireSeg(_segs[_idx]), 800);
    } else if (_onFin) _onFin();
  };

  window.speechSynthesis.speak(u);
}

/**
 * Démarre une séquence guidée.
 * ⚠️ DOIT être appelé directement depuis un handler de clic
 *    (pas depuis setTimeout) pour fonctionner sur iOS Safari.
 */
export function jouerScriptGuidé(
  segments: Segment[],
  onProgression?: (index: number, total: number) => void,
  onFin?: () => void
): void {
  arreter();
  _paused = false;
  _segs   = segments;
  _idx    = 0;
  _onProg = onProgression;
  _onFin  = onFin;

  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API non disponible');
    if (onFin) setTimeout(onFin, 1000);
    return;
  }

  // Annule tout speech en cours (important sur iOS)
  window.speechSynthesis.cancel();

  // Démarre immédiatement le premier segment (critique pour iOS)
  lireSeg(_segs[0]);
  if (_onProg) _onProg(0, _segs.length);
}

export function mettreEnPause(): void {
  _paused = true;
  window.speechSynthesis.pause();
  if (_timer) { clearTimeout(_timer); _timer = null; }
}

export function reprendre(): void {
  _paused = false;
  window.speechSynthesis.resume();
  // Si la synthèse s'est arrêtée, relancer depuis le segment courant
  if (!window.speechSynthesis.speaking && _idx < _segs.length) {
    lireSeg(_segs[_idx]);
  }
}

export function arreter(): void {
  _paused = false;
  window.speechSynthesis.cancel();
  if (_timer) { clearTimeout(_timer); _timer = null; }
  _segs  = [];
  _idx   = 0;
}

export function estEnCours(): boolean {
  return window.speechSynthesis.speaking && !_paused;
}

export function estEnPause(): boolean { return _paused; }
