import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startBinauralBeats, stopBinauralBeats, fadeOutBinauralBeats, debloquerBinauralBeats, suspendreBinauralBeats, reprendreBinauralBeats } from '../lib/binauralBeats';
import { loadUserProfile, generatePersonalizedYogaNidra } from '../lib/iaPersonnalisee';
import { textToSpeech } from '../lib/elevenLabs';
import { stockage } from '../lib/storage';
import { debloquerAudio } from '../lib/iosAudioUnlock';
import SOSFlottant from '../lib/SOSFlottant';

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
  const [enPause, setEnPause] = useState(false);
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

  const durees = {
    court: { min: 15, titre: 'Court 15 min', desc: 'Rapide et efficace' },
    moyen: { min: 30, titre: 'Moyen 30 min', desc: 'Complet et profond' },
    long: { min: 60, titre: 'Long 60 min', desc: 'Therapeutique intensif' },
  };

  // Lance la génération du contenu quand on commence la session
  const handleDemarrerSession = async () => {
    if (!duree) return;

    // 🔓 Débloque l'audio AVANT tout await — indispensable sur iOS Safari,
    // qui refuse de jouer un son généré après un délai réseau (génération
    // du script + conversion voix) si ce déblocage n'a pas lieu de façon
    // synchrone dans le geste de clic.
    const audio = debloquerAudio();
    debloquerBinauralBeats();
    setAudioPlayer(audio);

    setIsLoading(true);
    setErreurGeneration(false);
    setErreurMessage('');
    setEnPause(false);
    setPhase('session');

    try {
      // Charge le profil utilisateur
      const profile = loadUserProfile();

      // Génère le script personnalisé
      const script = await generatePersonalizedYogaNidra(duree, profile);

      // Convertit en audio avec Eleven Labs
      const url = await textToSpeech(script);
      setAudioUrl(url);

      if (!url) {
        // Échec silencieux évité : on prévient clairement plutôt que de
        // laisser l'utilisateur bloqué sur un écran figé sans son.
        setErreurGeneration(true);
        return;
      }

      // Réutilise le MÊME élément <audio> déjà débloqué plus haut — c'est
      // ce qui permet à iOS d'accepter la lecture malgré le délai réseau.
      audio.src = url;

      // Lance les binaural beats
      await startBinauralBeats('yoga', { duration: duree });

      // Lance l'audio
      audio.play().catch(err => console.error('Error playing audio:', err));
      setIsPlaying(true);

      // Track le temps
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          if (prev >= durees[duree!].min * 60) {
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

  // Met en pause / reprend l'audio, les binaural beats et le minuteur —
  // utile pour une pause pipi ou une interruption pendant la séance.
  const handlePauseReprendre = () => {
    if (!audioPlayer) return;

    if (enPause) {
      audioPlayer.play().catch(err => console.error('Error resuming audio:', err));
      reprendreBinauralBeats();
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          if (prev >= durees[duree!].min * 60) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      setEnPause(false);
    } else {
      audioPlayer.pause();
      suspendreBinauralBeats();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setEnPause(true);
    }
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
    stockage.ajouterEntree('yoga_nidra_pro', {
      nom: `Yoga Nidra Personnalisée ${durees[duree!].titre}`,
      duree_minutes: Math.round(sessionTime / 60),
      efficacite: Math.max(0, (apresScore - avantScore) * 15),
      avant: avantScore,
      apres: apresScore,
      audio_genere: !!audioUrl,
    });

    alert('Session Yoga Nidra sauvegardée!');
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={handleRetour} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
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

        {phase === 'session' && erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              Un souci technique
            </h2>
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              {erreurMessage || 'La génération de ta session personnalisée n\'a pas fonctionné cette fois-ci. Rien n\'est perdu — tu peux réessayer, ou revenir plus tard.'}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setPhase('avant')}
                style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retour
              </button>
              <button
                onClick={handleDemarrerSession}
                style={{ flex: 1, padding: '1rem', background: '#4ECDC4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {phase === 'session' && !erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              {isLoading ? 'Préparation de ta session...' : 'Session en cours...'}
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

            {isLoading ? (
              <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                Ta voix personnalisée et les binaural beats se préparent, quelques instants...
              </p>
            ) : (
              <>
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
              </>
            )}

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={handlePauseReprendre}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: enPause ? '#4ECDC4' : '#F0F0ED',
                  color: enPause ? 'white' : '#222',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  cursor: isLoading ? 'default' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  fontWeight: 600,
                }}
              >
                {enPause ? '▶️ Reprendre' : '⏸️ Pause'}
              </button>
              <button
                onClick={handleTerminerSession}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#F0F0ED',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  cursor: isLoading ? 'default' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  fontWeight: 600,
                }}
              >
                Terminer la session
              </button>
            </div>
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

      <SOSFlottant />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
