/**
 * voiceGuide.ts — Web Speech API, compatible iOS + Android
 * Expose le texte courant pour l'afficher en live dans l'UI.
 */

export type Segment = { texte: string; pause?: number };
// Le callback reçoit maintenant aussi le texte du segment courant
export type OnProgression = (index: number, total: number, texteActuel: string) => void;

let _idx    = 0;
let _segs:  Segment[] = [];
let _timer: ReturnType<typeof setTimeout> | null = null;
let _paused = false;
let _onProg: OnProgression | undefined;
let _onFin:  (() => void) | undefined;
let _texteActuel = '';

export function getTexteActuel(): string { return _texteActuel; }

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
  _texteActuel = seg.texte;

  const u    = new SpeechSynthesisUtterance(seg.texte);
  u.lang     = 'fr-FR';
  u.rate     = 0.82;
  u.pitch    = 0.95;
  u.volume   = 1.0;
  const v    = voixFr();
  if (v) u.voice = v;

  u.onend = () => {
    _idx++;
    if (_onProg) _onProg(_idx, _segs.length, _segs[_idx]?.texte ?? '');
    if (_idx >= _segs.length) { if (_onFin) _onFin(); return; }
    _timer = setTimeout(() => lireSeg(_segs[_idx]), _segs[_idx - 1].pause ?? 1200);
  };

  u.onerror = (e) => {
    if ((e as any).error === 'interrupted') return;
    _idx++;
    if (_idx < _segs.length) _timer = setTimeout(() => lireSeg(_segs[_idx]), 800);
    else if (_onFin) _onFin();
  };

  window.speechSynthesis.speak(u);
}

/** ⚠️ Appeler DIRECTEMENT depuis un handler onClick pour iOS */
export function jouerScriptGuidé(
  segments: Segment[],
  onProgression?: OnProgression,
  onFin?: () => void
): void {
  arreter();
  _paused = false;
  _segs   = segments;
  _idx    = 0;
  _onProg = onProgression;
  _onFin  = onFin;
  _texteActuel = '';

  if (!('speechSynthesis' in window)) {
    // Pas de voix dispo : on joue quand même (silencieux), avec progression simulée
    const dureeEstimee = segments.reduce((t, s) => t + (s.texte.length * 60) + (s.pause ?? 1200), 0);
    let elapsed = 0;
    const step = 2000;
    const interval = setInterval(() => {
      elapsed += step;
      const idx = Math.floor((elapsed / dureeEstimee) * segments.length);
      if (idx >= segments.length) { clearInterval(interval); if (onFin) onFin(); }
      else if (onProgression) onProgression(idx, segments.length, segments[idx]?.texte ?? '');
    }, step);
    return;
  }

  window.speechSynthesis.cancel();
  _texteActuel = segments[0]?.texte ?? '';
  lireSeg(_segs[0]);
  if (_onProg) _onProg(0, _segs.length, _texteActuel);
}

export function mettreEnPause(): void {
  _paused = true;
  window.speechSynthesis.pause();
  if (_timer) { clearTimeout(_timer); _timer = null; }
}

export function reprendre(): void {
  _paused = false;
  window.speechSynthesis.resume();
  if (!window.speechSynthesis.speaking && _idx < _segs.length) lireSeg(_segs[_idx]);
}

export function arreter(): void {
  _paused = false;
  window.speechSynthesis.cancel();
  if (_timer) { clearTimeout(_timer); _timer = null; }
  _segs = []; _idx = 0; _texteActuel = '';
}

export function voixDisponible(): boolean {
  return 'speechSynthesis' in window;
}

export function voixFranceDisponible(): boolean {
  return voixFr() !== null;
}

export function estEnCours(): boolean { return window.speechSynthesis.speaking && !_paused; }
export function estEnPause(): boolean { return _paused; }
