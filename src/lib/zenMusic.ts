/**
 * ZenMusic v2 — Sons vraiement relaxants
 *
 * V1 utilisait du "brown noise" qui produisait des bruits parasites.
 * V2 utilise uniquement des oscillateurs sinus (pure sine) avec :
 *   - Accord Am (La mineur) : harmonieux et mélancolique
 *   - LFO sur l'amplitude (respiration lente), pas sur la fréquence
 *   - Reverb simulée (delay + feedback)
 *   - Bols tibétains avec vraies harmoniques (ratios 1 : 2.756 : 5.404)
 */

export class ZenMusicPlayer {
  private ctx:      AudioContext | null = null;
  private master:   GainNode    | null = null;
  private delayL:   DelayNode   | null = null;
  private delayR:   DelayNode   | null = null;
  private fbGain:   GainNode    | null = null;
  private actif = false;
  private oscs:   OscillatorNode[] = [];
  private gains:  GainNode[]      = [];
  private timers: ReturnType<typeof setTimeout>[] = [];

  // ── init AudioContext (doit être appelé depuis un geste utilisateur) ─────
  private init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx  = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    // Reverb minimal : deux lignes de délai croisées
    this.delayL = this.ctx.createDelay(1);
    this.delayR = this.ctx.createDelay(1);
    this.delayL.delayTime.value = 0.12;
    this.delayR.delayTime.value = 0.17;

    this.fbGain = this.ctx.createGain();
    this.fbGain.gain.value = 0.22;

    this.master.connect(this.delayL);
    this.delayL.connect(this.delayR);
    this.delayR.connect(this.fbGain);
    this.fbGain.connect(this.delayL);   // boucle de feedback

    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.28;
    this.delayR.connect(wetGain);
    wetGain.connect(this.ctx.destination);

    this.master.connect(this.ctx.destination);
  }

  // ── API publique ──────────────────────────────────────────────────────────
  play(volume = 0.38) {
    this.init();
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.actif = true;

    this.buildAmPad();

    // Fade-in doux 5 secondes
    const now = this.ctx.currentTime;
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(volume, now + 5);

    // Premier bol après 7 secondes
    this.timers.push(setTimeout(() => this.scheduleBol(), 7000));
  }

  stop() {
    this.actif = false;
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];

    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 3);
    }

    setTimeout(() => {
      this.oscs.forEach(o  => { try { o.stop(); o.disconnect(); } catch (_) {} });
      this.gains.forEach(g => { try { g.disconnect(); }           catch (_) {} });
      this.oscs  = [];
      this.gains = [];
    }, 3500);
  }

  setVolume(v: number) {
    if (!this.master || !this.ctx) return;
    this.master.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, v)),
      this.ctx.currentTime + 0.4
    );
  }

  estActif() { return this.actif; }

  // ── Pad harmonique Am ─────────────────────────────────────────────────────
  // La(110) + Mi(164.8) + La(220) + Do(261.6) = accord La mineur
  private buildAmPad() {
    if (!this.ctx || !this.master) return;

    const voix: { f: number; amp: number; lfoHz: number }[] = [
      { f: 110.0,  amp: 0.16, lfoHz: 0.06 },   // La2 — basse
      { f: 164.8,  amp: 0.09, lfoHz: 0.04 },   // Mi3 — quinte
      { f: 220.0,  amp: 0.07, lfoHz: 0.08 },   // La3 — octave
      { f: 261.6,  amp: 0.04, lfoHz: 0.05 },   // Do4 — tierce mineure (très doux)
    ];

    voix.forEach(({ f, amp, lfoHz }) => {
      if (!this.ctx || !this.master) return;

      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // LFO d'amplitude (pas de fréquence — évite le vibrato artificiel)
      const lfo     = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = lfoHz;
      lfoGain.gain.value  = amp * 0.35;   // profondeur de modulation
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);         // module le volume, pas le pitch
      lfo.start();

      osc.type           = 'sine';
      osc.frequency.value = f;
      gain.gain.value    = amp;
      osc.connect(gain);
      gain.connect(this.master);
      osc.start();

      this.oscs.push(osc, lfo);
      this.gains.push(gain, lfoGain);
    });
  }

  // ── Bol tibétain ─────────────────────────────────────────────────────────
  // Harmoniques réelles d'un bol : 1x, 2.756x, 5.404x la fondamentale
  private jouerBol() {
    if (!this.ctx || !this.master) return;
    const freqs = [432, 528, 396, 384];
    const f0    = freqs[Math.floor(Math.random() * freqs.length)];
    const now   = this.ctx.currentTime;

    [[f0, 0.22], [f0 * 2.756, 0.09], [f0 * 5.404, 0.04]].forEach(([f, amp]) => {
      if (!this.ctx || !this.master) return;
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type            = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0,    now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 8);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 8.5);
    });
  }

  private scheduleBol() {
    if (!this.actif) return;
    this.jouerBol();
    const next = 28000 + Math.random() * 22000;   // 28–50 s
    this.timers.push(setTimeout(() => this.scheduleBol(), next));
  }
}

let _instance: ZenMusicPlayer | null = null;
export function getZenPlayer(): ZenMusicPlayer {
  if (!_instance) _instance = new ZenMusicPlayer();
  return _instance;
}
