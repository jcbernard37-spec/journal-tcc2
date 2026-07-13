import { useState, useRef, useEffect } from 'react';

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

export function BoutonMicroAvance({ 
  onTexteDicte 
}: { 
  onTexteDicte: (texte: string) => void;
}) {
  const [ecoute, setEcoute] = useState(false);
  const [texteFinal, setTexteFinal] = useState('');
  const [texteInterimaire, setTexteInterimaire] = useState('');
  const [modalOuverte, setModalOuverte] = useState(false);
  const [textePourEdition, setTextePourEdition] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supporte = dicteeSupportee();

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  if (!supporte) return null;

  const demarrerDictee = () => {
    setEcoute(true);
    setTexteFinal('');
    setTexteInterimaire('');
    setModalOuverte(false);

    const reco = getReconnaissance();
    if (!reco) {
      setEcoute(false);
      return;
    }

    reco.lang = 'fr-FR';
    reco.continuous = true;
    reco.interimResults = true;

    reco.onresult = (e: any) => {
      let interim = '';
      let final = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcription = e.results[i][0].transcript;
        
        if (e.results[i].isFinal) {
          final += transcription;
        } else {
          interim += transcription;
        }
      }

      // Affiche les résultats interimaires EN TEMPS RÉEL
      if (interim) {
        setTexteInterimaire(interim);
      }

      // Accumule les résultats finaux
      if (final) {
        setTexteFinal(prev => {
          const nouveau = prev + final;
          setTextePourEdition(nouveau);
          return nouveau;
        });
        setTexteInterimaire('');
      }
    };

    reco.onerror = () => {
      setEcoute(false);
    };

    reco.onend = () => {
      setEcoute(false);
      // Modal de confirmation après la dictée
      if (texteFinal.trim()) {
        setModalOuverte(true);
      }
    };

    recognitionRef.current = reco;
    try {
      reco.start();
    } catch {
      setEcoute(false);
    }
  };

  const arreterDictee = () => {
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setEcoute(false);
  };

  const ajouterTexte = () => {
    const texte = textePourEdition.trim();
    if (texte) {
      onTexteDicte(texte);
    }
    setModalOuverte(false);
    setTexteFinal('');
    setTexteInterimaire('');
    setTextePourEdition('');
  };

  const recommencer = () => {
    setModalOuverte(false);
    setTexteFinal('');
    setTexteInterimaire('');
    setTextePourEdition('');
    // Petit délai avant de relancer
    setTimeout(() => demarrerDictee(), 200);
  };

  return (
    <>
      {/* Bouton Micro */}
      <button
        type="button"
        onClick={ecoute ? arreterDictee : demarrerDictee}
        title={ecoute ? 'Arreter la dictee' : 'Dicter a voix haute'}
        aria-label={ecoute ? 'Arreter la dictee' : 'Dicter a voix haute'}
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
          background: ecoute ? '#FF6B6B' : '#DDD5C7',
          color: ecoute ? '#FFF' : '#333',
          transition: 'all 0.2s',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: ecoute ? '0 0 0 3px rgba(255, 107, 107, 0.2)' : 'none',
          animation: ecoute ? 'pulse 1.5s infinite' : 'none',
        } as any}
      >
        🎤
      </button>

      {/* Animation CSS pour le pulse */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Modal de confirmation et correction */}
      {modalOuverte && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '600px',
            borderRadius: '16px 16px 0 0',
            padding: '1.5rem',
            maxHeight: '80vh',
            overflow: 'auto',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>

            <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#333' }}>
              Verifie ta dictee
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
              Voici ce que j ai compris. Corrige si besoin, puis clique Ajouter.
            </p>

            {/* Texte interimaire si encore en cours */}
            {texteInterimaire && (
              <div style={{
                background: '#F0F0F0',
                padding: '0.8rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: '#999',
                fontStyle: 'italic',
              }}>
                En cours : {texteInterimaire}
              </div>
            )}

            {/* Champ editable pour la correction */}
            <textarea
              value={textePourEdition}
              onChange={(e) => setTextePourEdition(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                border: '1.5px solid #DDD5C7',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                minHeight: '120px',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}
            />

            <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1.2rem' }}>
              Tu peux modifier le texte ci-dessus si besoin.
            </p>

            {/* Boutons */}
            <div style={{
              display: 'flex',
              gap: '0.8rem',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={recommencer}
                style={{
                  padding: '0.8rem 1.2rem',
                  border: '1.5px solid #DDD5C7',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#333',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#F5F5F5';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'white';
                }}
              >
                Ressayer
              </button>
              <button
                onClick={ajouterTexte}
                style={{
                  padding: '0.8rem 1.2rem',
                  border: 'none',
                  background: 'var(--sauge)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'var(--sauge-fonce)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'var(--sauge)';
                }}
              >
                Ajouter ce texte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
