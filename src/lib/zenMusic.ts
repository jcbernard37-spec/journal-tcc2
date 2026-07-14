/**
 * Zen Music Generator — Web Audio API pure
 * Génère en temps réel : drone harmonique + rivière + bols tibétains
 * Zéro fichier audio externe, zéro dépendance.
 */

export class ZenMusicPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private actif = false;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private nodes: AudioNode[] = [];

  private init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
  }

  /** Démarre la musique avec un fade-in progressif */
  play(volume = 0.45) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.actif = true;

    this.createDrone();
    this.createRiviere();

    // Fade-in 4 secondes
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 4);

    // Premier bol après 5 secondes, puis périodiquement
    const t0 = setTimeout(() => this.programmeBols(), 5000);
    this.timers.push(t0);
  }

  /** Arrête avec un fade-out */
  stop() {
    if (!this.ctx || !this.masterGain) return;
    this.actif = false;

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 3);

    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];

    setTimeout(() => {
      this.nodes.forEach(n => {
        try { (n as OscillatorNode).stop?.(); } catch (_) {}
        try { n.disconnect(); } catch (_) {}
      });
      this.nodes = [];
    }, 3500);
  }

  setVolume(v: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, v)),
      this.ctx.currentTime + 0.5
    );
  }

  estActif() { return this.actif; }

  /**
   * Drone harmonique zen
   * Accord de quinte : 110 Hz (La2) + 165 Hz (Mi3) + 220 Hz (La3)
   * Son continu très doux, comme un orchestre lointain.
   */
  private createDrone() {
    if (!this.ctx || !this.masterGain) return;

    const layers: [number, number, OscillatorType][] = [
      [110, 0.14, 'sine'],
      [165, 0.08, 'sine'],
      [220, 0.06, 'sine'],
      [55,  0.05, 'sine'], // sub-grave très doux
    ];

    layers.forEach(([freq, vol, type]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // LFO très lent pour variation vivante (respiration de la musique)
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.value = 0.07 + Math.random() * 0.06;
      lfoGain.gain.value = freq * 0.003; // variation très subtile
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();

      this.nodes.push(osc, gain, lfo, lfoGain);
    });
  }

  /**
   * Son de rivière / eau courante
   * Brown noise filtré = bruit d'eau naturel et apaisant.
   */
  private createRiviere() {
    if (!this.ctx || !this.masterGain) return;

    // Buffer de bruit brun (random walk)
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(2, sampleRate * 4, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filtre passe-bas pour adoucir (coupe les fréquences agressives)
    const filtre = this.ctx.createBiquadFilter();
    filtre.type = 'lowpass';
    filtre.frequency.value = 700;
    filtre.Q.value = 0.5;

    // Filtre passe-haut pour retirer les graves excessifs
    const filtreHP = this.ctx.createBiquadFilter();
    filtreHP.type = 'highpass';
    filtreHP.frequency.value = 80;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;

    source.connect(filtre);
    filtre.connect(filtreHP);
    filtreHP.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.nodes.push(source, filtre, filtreHP, gain);
  }

  /**
   * Bol tibétain
   * Son pur à 432 Hz avec harmoniques + résonance longue.
   */
  private jouerBol(frequence = 432) {
    if (!this.ctx || !this.masterGain || !this.actif) return;
    const now = this.ctx.currentTime;

    // Fréquence fondamentale + harmoniques naturelles
    const harmoniques: [number, number][] = [
      [frequence, 0.22],
      [frequence * 2, 0.10],
      [frequence * 3.01, 0.05], // légèrement désaccordé = plus naturel
      [frequence * 4.03, 0.03],
    ];

    harmoniques.forEach(([freq, amp]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Enveloppe : attaque rapide, longue résonance
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 6);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 7);
    });
  }

  /**
   * Programme les bols à intervalles aléatoires (25–45 secondes)
   * pour un effet naturel et non-répétitif.
   */
  private programmeBols() {
    if (!this.actif) return;

    // Fréquences de bols variées
    const freqs = [432, 528, 396, 369];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    this.jouerBol(freq);

    const prochainBol = 25000 + Math.random() * 20000; // 25–45 sec
    const t = setTimeout(() => this.programmeBols(), prochainBol);
    this.timers.push(t);
  }
}

// Instance singleton partagée
let playerInstance: ZenMusicPlayer | null = null;

export function getZenPlayer(): ZenMusicPlayer {
  if (!playerInstance) playerInstance = new ZenMusicPlayer();
  return playerInstance;
}
