import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startBinauralBeats, stopBinauralBeats, fadeOutBinauralBeats } from '../lib/binauralBeats';
import { loadUserProfile, generatePersonalizedYogaNidra } from '../lib/iaPersonnalisee';
import { textToSpeech } from '../lib/elevenLabs';

type Duree = 'court' | 'moyen' | 'long';

export default function YogaNidraProAudio() {
  const navigate = useNavigate();
  const [duree, setDuree] = useState<Duree | null>(null);
  const [phase, setPhase] = useState<'choix' | 'avant' | 'session' | 'apres'>('choix');
  const [avantScore, setAvantScore] = useState(5);
  const [apresScore, setApresScore] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const durees = {
    court: { min: 15, titre: 'Court 15 min', desc: 'Rapide et efficace' },
    moyen: { min: 30, titre: 'Moyen 30 min', desc: 'Complet et profond' },
    long: { min: 60, titre: 'Long 60 min', desc: 'Therapeutique intensif' },
  };

  // Lance la génération du contenu quand on commence la session
  const handleDemarrerSession = async () => {
    if (!duree) return;
    
    setIsLoading(true);
    setPhase('session');

    try {
      // Charge le profil utilisateur
      const profile = loadUserProfile();

      // Génère le script personnalisé
      const script = await generatePersonalizedYogaNidra(duree, profile);

      // Convertit en audio avec Eleven Labs
      const url = await textToSpeech(script);
      setAudioUrl(url);

      if (url) {
        // Crée l'élément audio
        const audio = new Audio(url);
        setAudioPlayer(audio);

        // Lance les binaural beats
        await startBinauralBeats('yoga', { duration: duree });

        // Lance l'audio
        audio.play().catch(err => console.error('Error playing audio:', err));
        setIsPlaying(true);

        // Track le temps
        const interval = setInterval(() => {
          setSessionTime(prev => {
            if (prev >= durees[duree!].min * 60) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating session:', error);
      alert('Erreur lors de la génération de la session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminerSession = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setIsPlaying(false);
    }
    fadeOutBinauralBeats(3);
    setPhase('apres');
  };

  const handleSauvegarder = () => {
    const session = {
      id: Date.now().toString(),
      type: 'yoga_nidra_pro',
      nom: `Yoga Nidra Personnalisée ${durees[duree!].titre}`,
      duree: sessionTime / 60,
      date: new Date().toISOString(),
      efficacite: Math.max(0, (apresScore - avantScore) * 15),
      avantApres: { avant: avantScore, apres: apresScore },
      audioGenerated: !!audioUrl,
    };

    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);
    sessions.push(session);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(sessions));
    
    alert('Session Yoga Nidra sauvegardée!');
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={() => navigate('/outils-therapeutiques')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
          Retour
        </button>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.4rem', border: '1px solid #E8E6E1' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Yoga Nidra Personnalisée</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Session créée spécialement POUR TOI basée sur ton histoire et tes ressources.
            Voix professionnelle + Binaural Beats scientifiques inclus.
          </p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis ta durée</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginBottom: '1.4rem',
            }}>
              {Object.entries(durees).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setDuree(key as Duree)}
                  style={{
                    padding: '1.2rem',
                    border: duree === key ? '2px solid #4ECDC4' : '2px solid #E8E6E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: duree === key ? '#4ECDC4' : 'white',
                    color: duree === key ? 'white' : '#222',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                    {val.titre}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {val.desc}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => duree && setPhase('avant')}
              disabled={!duree}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#4ECDC4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continuer
            </button>
          </div>
        )}

        {phase === 'avant' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Avant la session</h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Comment tu te sens ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={avantScore} onChange={(e) => setAvantScore(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4ECDC4', marginTop: '0.4rem' }}>
                {avantScore}/10
              </div>
            </div>

            <div style={{ background: '#F0FFFE', padding: '1rem', borderRadius: '8px', marginBottom: '1.4rem', color: '#048876', fontSize: '0.95rem' }}>
              ✨ Nous allons générer une session PERSONNALISÉE basée sur ton histoire et tes ressources.
              <br />
              🔊 Tu entendras une voix professionnelle bienveillante.
              <br />
              🧠 Les binaural beats scientifiques vont maximiser l'efficacité.
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => setPhase('choix')} style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Retour
              </button>
              <button
                onClick={handleDemarrerSession}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: isLoading ? '#ccc' : '#4ECDC4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'default' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {isLoading ? 'Génération...' : 'Commencer'}
              </button>
            </div>
          </div>
        )}

        {phase === 'session' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              Session en cours...
            </h2>
            
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ECDC4, #45B3AA)',
                margin: '2rem auto',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            />

            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#4ECDC4',
              marginBottom: '1rem',
            }}>
              {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
            </div>

            {isPlaying && (
              <div style={{ color: '#4ECDC4', marginBottom: '1.4rem', fontSize: '0.95rem' }}>
                🎙️ Voix personnalisée en cours<br />
                🧠 Binaural beats scientifiques activés
              </div>
            )}

            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              Relaxe-toi complètement. Laisse-toi porter par la guidance.
            </p>

            <button
              onClick={handleTerminerSession}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#F0F0ED',
                border: '1.5px solid #E0DDD8',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Terminer la session
            </button>
          </div>
        )}

        {phase === 'apres' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Apres la session</h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Comment tu te sens maintenant ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={apresScore} onChange={(e) => setApresScore(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4ECDC4', marginTop: '0.4rem' }}>
                {apresScore}/10
              </div>
            </div>

            {apresScore > avantScore && (
              <div style={{
                background: '#E8F5E9',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.4rem',
                color: '#2E7D32',
                fontWeight: 600,
              }}>
                ✓ Amélioration : +{apresScore - avantScore}
              </div>
            )}

            <button
              onClick={handleSauvegarder}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#4ECDC4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              Sauvegarder
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
