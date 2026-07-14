import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Phase {
  name: string;
  description: string;
}

export default function EMDR() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'assessment' | 'ressources' | 'processing' | 'post' | 'fin'>('assessment');
  const [sudsAvant, setSudsAvant] = useState(5);
  const [sudsApres, setSudsApres] = useState(5);
  const [souvenir, setSouvenir] = useState('');
  const [ressource, setRessource] = useState('');
  const [typeStimulation, setTypeStimulation] = useState<'visuel' | 'auditif' | 'haptic'>('visuel');
  const [processing, setProcessing] = useState(false);
  const [dureeProcessing, setDureeProcessing] = useState(0);
  const [circleSide, setCircleSide] = useState<'left' | 'right'>('left');
  const [notes, setNotes] = useState('');

  // Simulation du processing EMDR
  useEffect(() => {
    if (processing && dureeProcessing < 300) { // 5 min max = 300 sec
      const interval = setInterval(() => {
        setCircleSide(prev => prev === 'left' ? 'right' : 'left');
        setDureeProcessing(prev => prev + 1);

        // Trigger audio si mode auditif
        if (typeStimulation === 'auditif') {
          playBip(circleSide === 'left' ? 300 : 200);
        }

        // Vibration haptic si mobile
        if (typeStimulation === 'haptic' && 'vibrate' in navigator) {
          navigator.vibrate(30);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else if (processing && dureeProcessing >= 300) {
      setProcessing(false);
      setPhase('post');
    }
  }, [processing, dureeProcessing, typeStimulation, circleSide]);

  const playBip = (frequency: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silencieux si erreur
    }
  };

  const sauvegarderSession = () => {
    const session = {
      id: Date.now().toString(),
      type: 'emdr',
      nom: souvenir || 'Session EMDR',
      duree: dureeProcessing,
      date: new Date().toISOString(),
      efficacite: Math.max(0, sudsAvant - sudsApres),
      avantApres: { avant: sudsAvant, apres: sudsApres },
      notes,
    };

    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);
    sessions.push(session);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(sessions));

    alert(`Session sauvegardée ! SUDS: ${sudsAvant} ${sudsApres}`);
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <style>{`
        .emdr-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #FF6B6B;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          animation: pulse 0.5s ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: translateY(-50%) scale(1); opacity: 1; }
          50% { transform: translateY(-50%) scale(1.1); opacity: 0.9; }
        }

        .emdr-track {
          width: 100%;
          height: 200px;
          background: #F0F0ED;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          border: 2px solid #E8E6E1;
        }

        .suds-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #FF6B6B, #FFD93D);
          appearance: none;
          cursor: pointer;
          -webkit-appearance: none;
        }

        .suds-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #FF6B6B;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .suds-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #FF6B6B;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .phase-card {
          background: white;
          border-radius: 12px;
          padding: 1.8rem;
          border: 1px solid #E8E6E1;
          margin-bottom: 1.4rem;
        }

        .phase-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 1rem;
        }

        .button-group {
          display: flex;
          gap: 0.8rem;
          margin-top: 1.4rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          flex: 1;
          min-width: 140px;
          padding: 1rem;
          background: #FF6B6B;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #FF5252;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .btn-secondary {
          flex: 1;
          min-width: 140px;
          padding: 1rem;
          background: #F0F0ED;
          color: #333;
          border: 1.5px solid #E0DDD8;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #E8E6E1;
        }
      `}</style>

      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button 
          onClick={() => navigate('/outils-therapeutiques')}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1.2rem',
          }}
        >
          ← Retour
        </button>

        <div className="phase-card">
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>EMDR Visuel</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Traite rapidement les traumas, peurs et souvenirs douloureux via la stimulation bilatérale.
          </p>
        </div>

        {/* PHASE 1: ASSESSMENT */}
        {phase === 'assessment' && (
          <div className="phase-card">
            <div className="phase-title">1. Décris ton souvenir / peur</div>

            <textarea
              value={souvenir}
              onChange={(e) => setSouvenir(e.target.value)}
              placeholder="Quel souvenir ou peur veux-tu traiter ?"
              style={{
                width: '100%',
                padding: '1rem',
                border: '1.5px solid #E8E6E1',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical',
                marginBottom: '1.4rem',
              }}
            />

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Sur une échelle de 0 à 10, quelle est l'intensité ?
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sudsAvant}
                  onChange={(e) => setSudsAvant(Number(e.target.value))}
                  className="suds-slider"
                  style={{ flex: 1 }}
                />
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#FF6B6B',
                  minWidth: '40px',
                }}>
                  {sudsAvant}/10
                </div>
              </div>
            </div>

            <div className="button-group">
              <button 
                className="btn-primary"
                onClick={() => souvenir && sudsAvant > 0 ? setPhase('ressources') : alert('Remplis le souvenir')}
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: RESSOURCES */}
        {phase === 'ressources' && (
          <div className="phase-card">
            <div className="phase-title">2. Installation de ressources</div>
            <p style={{ color: '#666', marginBottom: '1.2rem' }}>
              Avant de traiter le souvenir difficile, on ancre une ressource de sécurité en toi.
            </p>

            <textarea
              value={ressource}
              onChange={(e) => setRessource(e.target.value)}
              placeholder="Un moment où tu te sentais EN SÉCURITÉ. Décris-le en détail..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '1.5px solid #E8E6E1',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical',
                marginBottom: '1.4rem',
              }}
            />

            <div style={{
              background: '#E8F5E9',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.4rem',
              fontSize: '0.9rem',
              color: '#2E7D32',
            }}>
              ✓ Cette ressource te sera toujours accessible pendant la session.
            </div>

            <div className="button-group">
              <button className="btn-secondary" onClick={() => setPhase('assessment')}>← Retour</button>
              <button 
                className="btn-primary"
                onClick={() => setPhase('processing')}
              >
                Commencer le traitement
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: PROCESSING */}
        {phase === 'processing' && (
          <div className="phase-card">
            <div className="phase-title">3. Traitement EMDR</div>

            {!processing ? (
              <>
                <div style={{ marginBottom: '1.4rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', color: '#222' }}>
                    Choisir le type de stimulation
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.8rem' }}>
                    {(['visuel', 'auditif', 'haptic'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setTypeStimulation(type)}
                        style={{
                          padding: '0.8rem',
                          background: typeStimulation === type ? '#FF6B6B' : '#F0F0ED',
                          color: typeStimulation === type ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        {type === 'visuel' && '👁️ Visuel'}
                        {type === 'auditif' && '🔊 Auditif'}
                        {type === 'haptic' && '📳 Vibration'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: '#F5F5F5',
                  padding: '1.2rem',
                  borderRadius: '8px',
                  marginBottom: '1.4rem',
                  fontSize: '0.9rem',
                  color: '#666',
                }}>
                  <strong>Instructions :</strong> Pense au souvenir difficile. Laisse ton esprit vagabonder. Observe les pensées, images, sensations sans jugement.
                </div>

                <button
                  className="btn-primary"
                  onClick={() => {
                    setProcessing(true);
                    setDureeProcessing(0);
                  }}
                  style={{ width: '100%', fontSize: '1.1rem', padding: '1.2rem' }}
                >
                  Lancer le traitement (5 min)
                </button>
              </>
            ) : (
              <>
                {/* Affichage du traitement */}
                <div style={{ marginBottom: '1.4rem' }}>
                  <div className="emdr-track">
                    <div 
                      className="emdr-circle"
                      style={{
                        left: circleSide === 'left' ? '10%' : '80%',
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '1.2rem',
                  background: '#E8F5E9',
                  borderRadius: '8px',
                  marginBottom: '1.4rem',
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2E7D32' }}>
                    {Math.floor(dureeProcessing / 60)}:{String(dureeProcessing % 60).padStart(2, '0')}
                  </div>
                  <div style={{ color: '#666', marginTop: '0.4rem' }}>
                    Traitement en cours...
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setProcessing(false);
                    setPhase('post');
                  }}
                  style={{ width: '100%' }}
                >
                  Arrêter le traitement
                </button>
              </>
            )}
          </div>
        )}

        {/* PHASE 4: POST-PROCESSING */}
        {phase === 'post' && (
          <div className="phase-card">
            <div className="phase-title">4. Mesure post-traitement</div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Maintenant, quelle est l'intensité ?
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sudsApres}
                  onChange={(e) => setSudsApres(Number(e.target.value))}
                  className="suds-slider"
                  style={{ flex: 1 }}
                />
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#4ECDC4',
                  minWidth: '40px',
                }}>
                  {sudsApres}/10
                </div>
              </div>
            </div>

            {sudsAvant - sudsApres > 0 && (
              <div style={{
                background: '#E8F5E9',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.4rem',
                color: '#2E7D32',
                fontWeight: 600,
              }}>
                ✓ Amélioration : -{sudsAvant - sudsApres} point(s)
              </div>
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes optionnelles : qu'est-ce qui a changé ?"
              style={{
                width: '100%',
                padding: '1rem',
                border: '1.5px solid #E8E6E1',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical',
                marginBottom: '1.4rem',
              }}
            />

            <div className="button-group">
              <button className="btn-secondary" onClick={() => setPhase('processing')}>← Recommencer</button>
              <button 
                className="btn-primary"
                onClick={sauvegarderSession}
                style={{ fontSize: '1.1rem' }}
              >
                Sauvegarder la session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
