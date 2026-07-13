import { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════
// BOUTON MICRO — dictée vocale via l'API Web Speech du navigateur
// Gratuit, aucun audio stocké. Se cache si non supporté.
// ═══════════════════════════════════════════════════════

// Types minimaux (l'API n'est pas dans les types TS standard)
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

function getReconnaissance(): SpeechRecognitionLike | null {
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

export const dicteeSupportee = (): boolean => {
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
};

export function BoutonMicro({ onTexteDicte }: { onTexteDicte: (texte: string) => void }) {
  const [ecoute, setEcoute] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supporte = dicteeSupportee();

  useEffect(() => {
    return () => {
      // Arrêt propre si le composant disparaît
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  if (!supporte) return null;

  const basculer = () => {
    if (ecoute) {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      setEcoute(false);
      return;
    }

    const reco = getReconnaissance();
    if (!reco) return;

    reco.lang = 'fr-FR';
    reco.continuous = true;
    reco.interimResults = false;

    reco.onresult = (e: any) => {
      let texte = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          texte += e.results[i][0].transcript;
        }
      }
      if (texte.trim()) {
        onTexteDicte(texte.trim());
      }
    };

    reco.onerror = () => setEcoute(false);
    reco.onend = () => setEcoute(false);

    recognitionRef.current = reco;
    try {
      reco.start();
      setEcoute(true);
    } catch {
      setEcoute(false);
    }
  };

  return (
    <button
      type="button"
      onClick={basculer}
      title={ecoute ? 'Arrêter la dictée' : 'Dicter à voix haute'}
      aria-label={ecoute ? 'Arrêter la dictée' : 'Dicter à voix haute'}
      className="no-print"
      style={{
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50%',
        width: 42,
        height: 42,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        background: ecoute ? 'var(--crise)' : 'var(--sauge-pale)',
        color: ecoute ? 'white' : 'var(--sauge-fonce)',
        transition: 'all 0.15s',
        animation: ecoute ? 'pulse-micro 1.2s ease-in-out infinite' : 'none',
      }}
    >
      {ecoute ? '⏹️' : '🎤'}
    </button>
  );
}
