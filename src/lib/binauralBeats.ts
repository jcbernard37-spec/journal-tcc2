/**
 * Binaural Beats Generator
 * Génère des fréquences scientifiques pour une efficacité maximale
 * 
 * Science:
 * - Alpha (8-12Hz): Relaxation consciente, créativité
 * - Theta (4-8Hz): Méditation profonde, imagination
 * - Delta (1-4Hz): Sommeil, guérison
 * - Beta (12-38Hz): Alerte, focus
 */

interface BinauralConfig {
  baseFrequency: number; // Fréquence de base (Hz)
  beatFrequency: number; // Fréquence du beat (Hz)
  duration: number; // Durée en secondes
  volume: number; // Volume (0-1)
  leftChannel: number; // Fréquence oreille gauche
  rightChannel: number; // Fréquence oreille droite
}

export class BinauralBeatsGenerator {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private isPlaying = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  /**
   * Crée des binaural beats pour Yoga Nidra
   * Alpha + Theta = Relaxation profonde + accès subconscient
   */
  static getYogaNidraConfig(duration: 'court' | 'moyen' | 'long'): BinauralConfig {
    const durationSeconds =
      duration === 'court' ? 15 * 60 : duration === 'moyen' ? 30 * 60 : 60 * 60;

    return {
      baseFrequency: 100, // Fréquence de base
      beatFrequency: 6, // Theta beat (relaxation profonde)
      duration: durationSeconds,
      volume: 0.3, // Subtil, pas envahissant
      leftChannel: 100,
      rightChannel: 106, // Différence de 6Hz = Theta
    };
  }

  /**
   * Crée des binaural beats pour Hypnose
   * Theta profond + Delta light = Trance hypnotique
   */
  static getHypnosisConfig(type: 'relaxation' | 'croyance' | 'ressource'): BinauralConfig {
    const durationSeconds =
      type === 'relaxation' ? 20 * 60 : type === 'croyance' ? 40 * 60 : 30 * 60;

    return {
      baseFrequency: 100,
      beatFrequency: 4, // Deep Theta (hypnose profonde)
      duration: durationSeconds,
      volume: 0.25, // Très subtil pour hypnose
      leftChannel: 100,
      rightChannel: 104, // 4Hz beat
    };
  }

  /**
   * Crée des binaural beats pour EMDR
   * Alpha alternating = Stimulation bilatérale synchrone
   */
  static getEMDRConfig(): BinauralConfig {
    return {
      baseFrequency: 100,
      beatFrequency: 1, // 1 beat/sec = stimulation bilatérale
      duration: 5 * 60, // 5 min standard EMDR
      volume: 0.2,
      leftChannel: 100,
      rightChannel: 101, // Alternance rapide
    };
  }

  /**
   * Crée des binaural beats pour Méditation
   * Alpha stable = Conscience calme et centrée
   */
  static getMeditationConfig(type: 'body_scan' | 'gratitude' | 'bienveillance'): BinauralConfig {
    const durationSeconds =
      type === 'body_scan' ? 15 * 60 : type === 'gratitude' ? 15 * 60 : 20 * 60;

    return {
      baseFrequency: 100,
      beatFrequency: 10, // Alpha stable (calme alerte)
      duration: durationSeconds,
      volume: 0.3,
      leftChannel: 100,
      rightChannel: 110, // 10Hz beat
    };
  }

  /**
   * Débloque l'AudioContext depuis un geste utilisateur.
   * À appeler de façon SYNCHRONE, avant tout `await`, sinon iOS Safari
   * refusera de reprendre un contexte audio suspendu.
   */
  debloquer(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  /**
   * Lance les binaural beats
   */
  play(config: BinauralConfig): void {
    if (!this.audioContext || this.isPlaying) return;

    try {
      const ctx = this.audioContext;

      // Résume si en pause
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Crée les oscillateurs
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();

      leftOsc.frequency.value = config.leftChannel;
      rightOsc.frequency.value = config.rightChannel;
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';

      // Crée les gains
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      const masterGain = ctx.createGain();

      leftGain.gain.value = config.volume;
      rightGain.gain.value = config.volume;
      masterGain.gain.value = 0.8; // Master volume

      // Fusionne les deux oscillateurs mono (gauche/droite) en un seul flux stéréo.
      // ⚠️ ChannelMergerNode (2 entrées → 1 sortie stéréo), PAS ChannelSplitterNode
      // (1 entrée → 2 sorties) — c'est l'inverse qu'il fallait utiliser ici, d'où
      // l'erreur "input index (1) exceeds number of inputs (1)".
      const merger = ctx.createChannelMerger(2);

      // Connecte
      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Démarre
      leftOsc.start();
      rightOsc.start();

      // Arrête après la durée
      leftOsc.stop(ctx.currentTime + config.duration);
      rightOsc.stop(ctx.currentTime + config.duration);

      this.oscillators = [leftOsc, rightOsc];
      this.gains = [leftGain, rightGain, masterGain];
      this.isPlaying = true;

      // Arrête après la durée
      setTimeout(() => {
        this.stop();
      }, config.duration * 1000);
    } catch (error) {
      console.error('Error playing binaural beats:', error);
    }
  }

  /**
   * Met en pause les binaural beats (sans les arrêter définitivement) —
   * suspend le AudioContext, ce qui gèle aussi les oscillateurs en cours.
   */
  suspendre(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend().catch(() => {});
    }
  }

  /** Reprend les binaural beats après une pause. */
  reprendre(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  /**
   * Arrête les binaural beats
   */
  stop(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Déjà arrêté
      }
    });
    this.oscillators = [];
    this.gains = [];
    this.isPlaying = false;
  }

  /**
   * Ajuste le volume
   */
  setVolume(volume: number): void {
    if (this.gains.length >= 3) {
      this.gains[2].gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Fait un fade out progressif
   */
  fadeOut(duration = 3): void {
    if (!this.audioContext || this.gains.length < 3) return;

    const masterGain = this.gains[2];
    const startTime = this.audioContext.currentTime;
    const endTime = startTime + duration;

    masterGain.gain.setValueAtTime(masterGain.gain.value, startTime);
    masterGain.gain.linearRampToValueAtTime(0, endTime);

    setTimeout(() => {
      this.stop();
    }, duration * 1000);
  }

  /**
   * Crée une analyse en temps réel (pour UI)
   */
  createAnalyser(): AnalyserNode | null {
    if (!this.audioContext) return null;

    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;

    if (this.gains.length >= 3) {
      this.gains[2].connect(analyser);
    }

    return analyser;
  }
}

// Instance singleton
let generator: BinauralBeatsGenerator | null = null;

export function getBinauralGenerator(): BinauralBeatsGenerator {
  if (!generator) {
    generator = new BinauralBeatsGenerator();
  }
  return generator;
}

/**
 * Démarre les binaural beats pour un outil spécifique
 */
export async function startBinauralBeats(
  tool: 'yoga' | 'hypnose' | 'emdr' | 'meditation',
  params?: any
): Promise<void> {
  const gen = getBinauralGenerator();

  let config: BinauralConfig;

  if (tool === 'yoga') {
    config = BinauralBeatsGenerator.getYogaNidraConfig(params?.duration || 'moyen');
  } else if (tool === 'hypnose') {
    config = BinauralBeatsGenerator.getHypnosisConfig(params?.type || 'relaxation');
  } else if (tool === 'emdr') {
    config = BinauralBeatsGenerator.getEMDRConfig();
  } else {
    config = BinauralBeatsGenerator.getMeditationConfig(params?.type || 'body_scan');
  }

  gen.play(config);
}

export function stopBinauralBeats(): void {
  const gen = getBinauralGenerator();
  gen.stop();
}

/**
 * Débloque l'AudioContext des binaural beats depuis un geste utilisateur.
 * À appeler de façon SYNCHRONE, en tout premier, avant tout `await`.
 */
export function debloquerBinauralBeats(): void {
  getBinauralGenerator().debloquer();
}

/** Met en pause les binaural beats sans les arrêter (peut reprendre après). */
export function suspendreBinauralBeats(): void {
  getBinauralGenerator().suspendre();
}

/** Reprend les binaural beats après une pause. */
export function reprendreBinauralBeats(): void {
  getBinauralGenerator().reprendre();
}

export function fadeOutBinauralBeats(duration = 3): void {
  const gen = getBinauralGenerator();
  gen.fadeOut(duration);
}

export default getBinauralGenerator;
