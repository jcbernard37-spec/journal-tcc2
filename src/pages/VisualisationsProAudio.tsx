import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startBinauralBeats, stopBinauralBeats, fadeOutBinauralBeats, debloquerBinauralBeats } from '../lib/binauralBeats';
import { loadUserProfile, generatePersonalizedVisualization } from '../lib/iaPersonnalisee';
import { textToSpeech } from '../lib/elevenLabs';
import { stockage } from '../lib/storage';
import { debloquerAudio } from '../lib/iosAudioUnlock';
import SOSFlottant from '../lib/SOSFlottant';

type VisuType = 'abondance' | 'guerison' | 'enfant' | 'ressources' | 'safe' | 'dialogue';

export default function VisualisationsProAudio() {
  const navigate = useNavigate();
  const [type, setType] = useState<VisuType | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [ressentieScore, setRessentieScore] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [erreurGeneration, setErreurGeneration] = useState(false);
  const [erreurMessage, setErreurMessage] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Coupe systématiquement le son et les binaural beats si l'utilisateur
  // quitte la page (navigation, fermeture d'onglet) pendant une session.
  useEffect(() => {
    return () => {
      audioPlayer?.pause();
      stopBinauralBeats();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [audioPlayer]);

  const visualisations: Record<VisuType, { titre: string; desc: string; duree: string; icon: string }> = {
    abondance: { titre: 'Abondance Manifestation', desc: 'Attire ce que tu veux', duree: '30 min', icon: '🌟' },
    guerison: { titre: 'Guerison Emotionnelle', desc: 'Pardonne et libere-toi', duree: '40 min', icon: '💔' },
    enfant: { titre: 'Enfant Interieur', desc: 'Rencontre ta version enfant', duree: '45 min', icon: '👶' },
    ressources: { titre: 'Ressources Futures', desc: 'Visualise ton succes', duree: '25 min', icon: '🚀' },
    safe: { titre: 'Safe Place', desc: 'Cree ton lieu de securite', duree: '20 min', icon: '🏝️' },
    dialogue: { titre: 'Dialogue Transformateur', desc: 'Parle a tes emotions', duree: '50 min', icon: '🗣️' },
  };

  const handleDemarrerSession = async () => {
    if (!type) return;

    // 🔓 Débloque l'audio AVANT tout await — indispensable sur iOS Safari.
    const audio = debloquerAudio();
    debloquerBinauralBeats();
    setAudioPlayer(audio);

    setIsLoading(true);
    setErreurGeneration(false);
    setErreurMessage('');
    setPhase('session');

    try {
      const profile = loadUserProfile();
      const script = await generatePersonalizedVisualization(type, profile);
      const url = await textToSpeech(script);
      setAudioUrl(url);

      if (!url) {
        // Échec silencieux évité : on prévient clairement plutôt que de
        // laisser l'utilisateur bloqué sur un écran figé sans son.
        setErreurGeneration(true);
        return;
      }

      // Réutilise le MÊME élément <audio> déjà débloqué plus haut.
      audio.src = url;
      await startBinauralBeats('meditation', { type: 'gratitude' });
      audio.play().catch(err => console.error('Error playing:', err));
      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          const durations: Record<VisuType, number> = {
            abondance: 30,
            guerison: 40,
            enfant: 45,
            ressources: 25,
            safe: 20,
            dialogue: 50,
          };
          const maxTime = (durations[type!] || 30) * 60;
          if (prev >= maxTime) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setErreurMessage(error instanceof Error ? error.message : '');
      setErreurGeneration(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminerSession = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setIsPlaying(false);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    fadeOutBinauralBeats(3);
    setPhase('apres');
  };

  // Le bouton "Retour" doit couper le son avant de quitter la page,
  // sinon audio + binaural beats continuent de jouer en arrière-plan.
  const handleRetour = () => {
    audioPlayer?.pause();
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopBinauralBeats();
    navigate('/outils-therapeutiques');
  };

  const handleSauvegarder = () => {
    stockage.ajouterEntree('visualization_pro', {
      nom: visualisations[type!].titre,
      duree_minutes: Math.round(sessionTime / 60),
      efficacite: ressentieScore * 15,
      ressenti: ressentieScore,
      audio_genere: !!audioUrl,
    });

    alert('Session Visualization sauvegardee!');
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={handleRetour} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
          Retour
        </button>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.4rem', border: '1px solid #E8E6E1' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Visualisations Cratrices</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Guidage narratif personnalisé + voix professionnelle + binaural beats.
          </p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis une visualization</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              marginBottom: '1.4rem',
            }}>
              {Object.entries(visualisations).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setType(key as VisuType)}
                  style={{
                    padding: '1.4rem',
                    border: type === key ? '2px solid #FFD93D' : '2px solid #E8E6E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: type === key ? 'rgba(255, 217, 61, 0.1)' : 'white',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>
                    {val.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#222' }}>
                    {val.titre}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                    {val.duree}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    {val.desc}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => type && handleDemarrerSession()}
              disabled={!type || isLoading}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: isLoading ? '#ccc' : '#FFD93D',
                color: '#222',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: isLoading ? 'default' : 'pointer',
              }}
            >
              {isLoading ? 'Generation...' : 'Commencer'}
            </button>
          </div>
        )}

        {phase === 'session' && erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              Un souci technique
            </h2>
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              {erreurMessage || 'La génération de ta visualisation personnalisée n\'a pas fonctionné cette fois-ci. Rien n\'est perdu — tu peux réessayer, ou revenir plus tard.'}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setPhase('choix')}
                style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retour
              </button>
              <button
                onClick={handleDemarrerSession}
                style={{ flex: 1, padding: '1rem', background: '#FFD93D', color: '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {phase === 'session' && !erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              {isLoading ? 'Préparation de ta visualisation...' : visualisations[type!].titre}
            </h2>
            
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD93D, #FFC93D)',
                margin: '2rem auto',
                animation: 'glow 3s ease-in-out infinite',
              }}
            />

            {isLoading ? (
              <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                Ta voix personnalisée et les Alpha beats se préparent, quelques instants...
              </p>
            ) : (
              <>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#FFD93D',
                  marginBottom: '1rem',
                }}>
                  {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
                </div>

                {isPlaying && (
                  <div style={{ color: '#FFD93D', marginBottom: '1.4rem', fontSize: '0.95rem' }}>
                    🎙️ Guidage narratif personnalisé<br />
                    🧠 Alpha beats pour creativilite
                  </div>
                )}

                <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                  Ferme tes yeux. Visualise en detail. Utilise tous tes sens.
                </p>
              </>
            )}

            <button
              onClick={handleTerminerSession}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#F0F0ED',
                border: '1.5px solid #E0DDD8',
                borderRadius: '8px',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                fontWeight: 600,
              }}
            >
              Visualization Terminee
            </button>
          </div>
        )}

        {phase === 'apres' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Apres</h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Qu'as-tu ressenti ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={ressentieScore} onChange={(e) => setRessentieScore(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFD93D', marginTop: '0.4rem' }}>
                {ressentieScore}/10
              </div>
            </div>

            <button
              onClick={handleSauvegarder}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#FFD93D',
                color: '#222',
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

      <SOSFlottant />

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 217, 61, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 217, 61, 0.6); }
        }
      `}</style>
    </div>
  );
}
