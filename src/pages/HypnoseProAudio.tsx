import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startBinauralBeats, stopBinauralBeats, fadeOutBinauralBeats, debloquerBinauralBeats } from '../lib/binauralBeats';
import { loadUserProfile, generatePersonalizedHypnosis } from '../lib/iaPersonnalisee';
import { textToSpeech } from '../lib/elevenLabs';
import { stockage } from '../lib/storage';
import { debloquerAudio } from '../lib/iosAudioUnlock';
import SOSFlottant from '../lib/SOSFlottant';

type Niveau = 'relaxation' | 'croyance' | 'ressource';

export default function HypnoseProAudio() {
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [phase, setPhase] = useState<'choix' | 'setup' | 'session' | 'apres'>('choix');
  const [croyance, setCreyance] = useState('');
  const [apresScore, setApresScore] = useState(5);
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

  const niveaux = {
    relaxation: { titre: 'Hypnose Relaxation', duree: '20 min', desc: 'Calme et securite' },
    croyance: { titre: 'Changement de Croyance', duree: '40 min', desc: 'Reprogramme tes patterns' },
    ressource: { titre: 'Ancrage de Ressource', duree: '30 min', desc: 'Amplifier ta puissance' },
  };

  const handleDemarrerSession = async () => {
    if (!niveau) return;

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
      const script = await generatePersonalizedHypnosis(niveau, croyance, profile);
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
      await startBinauralBeats('hypnose', { type: niveau });
      audio.play().catch(err => console.error('Error playing audio:', err));
      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          const maxTime = niveau === 'relaxation' ? 20 * 60 : niveau === 'croyance' ? 40 * 60 : 30 * 60;
          if (prev >= maxTime) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error generating session:', error);
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
    stockage.ajouterEntree('hypnose_pro', {
      nom: niveaux[niveau!].titre,
      duree_minutes: Math.round(sessionTime / 60),
      efficacite: apresScore * 15,
      apres: apresScore,
      croyance,
      audio_genere: !!audioUrl,
    });

    alert('Session Hypnose sauvegardée!');
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={handleRetour} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
          Retour
        </button>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.4rem', border: '1px solid #E8E6E1' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Hypnose Personnalisée</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Induction Ericksonienne créée POUR TOI. Voix professionnelle + Theta beats scientifiques.
          </p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis ton niveau</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.4rem',
            }}>
              {Object.entries(niveaux).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setNiveau(key as Niveau)}
                  style={{
                    padding: '1.2rem',
                    border: niveau === key ? '2px solid #9D84B7' : '2px solid #E8E6E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: niveau === key ? '#9D84B7' : 'white',
                    color: niveau === key ? 'white' : '#222',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
                    {val.titre}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.4rem' }}>
                    {val.duree}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {val.desc}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => niveau && setPhase('setup')}
              disabled={!niveau}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#9D84B7',
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

        {phase === 'setup' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Preparation</h2>

            {niveau === 'croyance' && (
              <textarea
                value={croyance}
                onChange={(e) => setCreyance(e.target.value)}
                placeholder="Quelle croyance limitante veux-tu changer?"
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
            )}

            <div style={{ background: '#F8F5FB', padding: '1rem', borderRadius: '8px', marginBottom: '1.4rem', color: '#6B4F99', fontSize: '0.95rem' }}>
              ✨ Nous générons une induction UNIQUE basée sur ton histoire.
              <br />
              🔊 Voix professionnelle bienveillante.
              <br />
              🧠 Theta beats pour trance profonde.
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
                  background: isLoading ? '#ccc' : '#9D84B7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'default' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {isLoading ? 'Generation...' : 'Commencer'}
              </button>
            </div>
          </div>
        )}

        {phase === 'session' && erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              Un souci technique
            </h2>
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              {erreurMessage || 'La génération de ton induction personnalisée n\'a pas fonctionné cette fois-ci. Rien n\'est perdu — tu peux réessayer, ou revenir plus tard.'}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setPhase('setup')}
                style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retour
              </button>
              <button
                onClick={handleDemarrerSession}
                style={{ flex: 1, padding: '1rem', background: '#9D84B7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {phase === 'session' && !erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              {isLoading ? 'Préparation de ton induction...' : 'Induction hypnotique...'}
            </h2>
            
            <div
              style={{
                width: '100px',
                height: '100px',
                margin: '2rem auto',
                border: '3px solid #9D84B7',
                borderRadius: '50%',
                animation: 'spin 4s linear infinite',
              }}
            />

            {isLoading ? (
              <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                Ta voix personnalisée et les Theta beats se préparent, quelques instants...
              </p>
            ) : (
              <>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#9D84B7',
                  marginBottom: '1rem',
                }}>
                  {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
                </div>

                {isPlaying && (
                  <div style={{ color: '#9D84B7', marginBottom: '1.4rem', fontSize: '0.95rem' }}>
                    🎙️ Voix personnalisée en cours<br />
                    🧠 Theta beats pour trance
                  </div>
                )}

                <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                  Ferme tes yeux. Laisse-toi guider dans l induction.
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
              Terminer
            </button>
          </div>
        )}

        {phase === 'apres' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Apres la session</h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Comment tu te sens ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={apresScore} onChange={(e) => setApresScore(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#9D84B7', marginTop: '0.4rem' }}>
                {apresScore}/10
              </div>
            </div>

            <button
              onClick={handleSauvegarder}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#9D84B7',
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

      <SOSFlottant />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
