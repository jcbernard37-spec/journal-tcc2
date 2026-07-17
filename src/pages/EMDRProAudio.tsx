import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startBinauralBeats, stopBinauralBeats, debloquerBinauralBeats, suspendreBinauralBeats, reprendreBinauralBeats } from '../lib/binauralBeats';
import { loadUserProfile, generatePersonalizedEMDRIntro } from '../lib/iaPersonnalisee';
import { textToSpeech } from '../lib/elevenLabs';
import { stockage } from '../lib/storage';
import { debloquerAudio } from '../lib/iosAudioUnlock';
import SOSFlottant from '../lib/SOSFlottant';

export default function EMDRProAudio() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'info' | 'suds' | 'intro' | 'processing' | 'post'>('info');
  const [sudsAvant, setSudsAvant] = useState(7);
  const [sudsApres, setSudsApres] = useState(7);
  const [ressource, setRessource] = useState('');
  const [duree, setDuree] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enPause, setEnPause] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [cycleCount, setCycleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [erreurGeneration, setErreurGeneration] = useState(false);
  const [erreurMessage, setErreurMessage] = useState('');
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'processing' && isProcessing) {
      const interval = setInterval(() => {
        setDirection(prev => prev === 'left' ? 'right' : 'left');
      }, 500);

      const timer = setInterval(() => {
        setDuree(prev => prev + 1);
        setCycleCount(prev => prev + 1);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(timer);
      };
    }
  }, [phase, isProcessing]);

  // Coupe systématiquement le son et les binaural beats si l'utilisateur
  // quitte la page (navigation, fermeture d'onglet) à tout moment.
  useEffect(() => {
    return () => {
      audioPlayer?.pause();
      stopBinauralBeats();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [audioPlayer]);

  // Génère et joue l'introduction vocale personnalisée, puis attend la fin
  // de la voix avant de proposer de lancer la stimulation bilatérale
  // silencieuse (on ne parle pas pendant les passages EMDR eux-mêmes).
  const handleLancerIntro = async () => {
    // 🔓 Débloque l'audio AVANT tout await — indispensable sur iOS Safari.
    const audio = debloquerAudio();
    debloquerBinauralBeats();
    setAudioPlayer(audio);

    setIsLoading(true);
    setErreurGeneration(false);
    setErreurMessage('');
    setPhase('intro');

    try {
      const profile = loadUserProfile();
      const script = await generatePersonalizedEMDRIntro(sudsAvant, ressource, profile);
      const url = await textToSpeech(script);

      if (!url) {
        setErreurGeneration(true);
        return;
      }

      // Réutilise le MÊME élément <audio> déjà débloqué plus haut.
      audio.src = url;
      audio.play().catch(err => console.error('Error playing audio:', err));
    } catch (error) {
      console.error('Error generating EMDR intro:', error);
      setErreurMessage(error instanceof Error ? error.message : '');
      setErreurGeneration(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemarrerTraitement = async () => {
    audioPlayer?.pause();
    setIsProcessing(true);
    setEnPause(false);
    setPhase('processing');
    await startBinauralBeats('emdr');
  };

  const handleArretTraitement = () => {
    setIsProcessing(false);
    stopBinauralBeats();
    setPhase('post');
  };

  // Met en pause / reprend la stimulation bilatérale et les binaural beats
  // — utile pour une pause pipi ou une interruption pendant la séance.
  // Réutilise `isProcessing` : le passer à false arrête déjà proprement
  // les intervals (via le useEffect existant), le repasser à true les relance.
  const handlePauseReprendre = () => {
    if (enPause) {
      setIsProcessing(true);
      reprendreBinauralBeats();
      setEnPause(false);
    } else {
      setIsProcessing(false);
      suspendreBinauralBeats();
      setEnPause(true);
    }
  };

  // Le bouton "Retour" doit couper le son et les binaural beats avant de
  // quitter la page, sinon ils continuent de jouer en arrière-plan.
  const handleRetour = () => {
    audioPlayer?.pause();
    setIsProcessing(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopBinauralBeats();
    navigate('/outils-therapeutiques');
  };

  const handleSauvegarder = () => {
    stockage.ajouterEntree('emdr_pro', {
      nom: 'Session EMDR Bilatérale Guidée',
      duree_minutes: Math.round(duree / 60),
      suds_avant: sudsAvant,
      suds_apres: sudsApres,
      efficacite: (sudsAvant - sudsApres) * 10,
      cycles: cycleCount,
      ressource,
    });

    alert('Session EMDR PRO sauvegardee!');
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={handleRetour} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
          Retour
        </button>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.4rem', border: '1px solid #E8E6E1' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>EMDR Bilatéral Guidé</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Traitement bilatéral + guidage voix + binaural beats 1Hz.
          </p>
        </div>

        {phase === 'info' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>Info EMDR</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              L'EMDR (Eye Movement Desensitization and Reprocessing) est une thérapie scientifiquement validée pour traiter les traumatismes et les peurs.
            </p>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Cette version PRO inclut:
              <br />• Stimulation bilatérale synchrone (left/right)
              <br />• Guidage professionnel
              <br />• Binaural beats 1Hz (synchronisation cérébrale)
              <br />• Mesure SUDS (Subjective Units of Distress)
            </p>
            <button
              onClick={() => setPhase('suds')}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Commencer
            </button>
          </div>
        )}

        {phase === 'suds' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Échelle SUDS</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Avant le traitement, évalue ta détresse (0 = pas du tout, 10 = maximum):
            </p>
            <input
              type="range"
              min="0"
              max="10"
              value={sudsAvant}
              onChange={(e) => setSudsAvant(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FF6B6B', marginBottom: '1.4rem' }}>
              SUDS: {sudsAvant}/10
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Quelle ressource t'aidera? (personne, endroit, force)
              </label>
              <input
                type="text"
                value={ressource}
                onChange={(e) => setRessource(e.target.value)}
                placeholder="Exemple: Ma mère, la montagne, ma force interieure..."
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1.5px solid #E8E6E1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginBottom: '1.4rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => setPhase('info')} style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Retour
              </button>
              <button
                onClick={handleLancerIntro}
                disabled={sudsAvant === 0}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: sudsAvant === 0 ? '#ccc' : '#FF6B6B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: sudsAvant === 0 ? 'default' : 'pointer',
                  fontWeight: 600,
                }}
              >
                Commencer Traitement
              </button>
            </div>
          </div>
        )}

        {phase === 'intro' && erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              Un souci technique
            </h2>
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              {erreurMessage || 'La génération de ton introduction personnalisée n\'a pas fonctionné cette fois-ci. Rien n\'est perdu — tu peux réessayer, ou revenir plus tard.'}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setPhase('suds')}
                style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retour
              </button>
              <button
                onClick={handleLancerIntro}
                style={{ flex: 1, padding: '1rem', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {phase === 'intro' && !erreurGeneration && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              {isLoading ? 'Préparation de ton introduction...' : 'Introduction guidée'}
            </h2>

            <div
              style={{
                width: '100px',
                height: '100px',
                margin: '2rem auto',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B6B, #FFB3B3)',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            />

            {isLoading ? (
              <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                Ta voix personnalisée se prépare, quelques instants...
              </p>
            ) : (
              <p style={{ color: '#666', marginBottom: '1.4rem' }}>
                🎙️ Écoute l'introduction jusqu'au bout, puis lance la stimulation
                bilatérale silencieuse quand tu te sens prête.
              </p>
            )}

            <button
              onClick={handleDemarrerTraitement}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: isLoading ? '#ccc' : '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'default' : 'pointer',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              Lancer la stimulation bilatérale
            </button>
          </div>
        )}

        {phase === 'processing' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', color: '#222' }}>
              Traitement EMDR en cours
            </h2>

            {/* Animation bilatérale */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '2rem',
              height: '200px',
              alignItems: 'center',
            }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: direction === 'left' ? '#FF6B6B' : '#FFB3B3',
                  opacity: direction === 'left' ? 1 : 0.3,
                  transition: 'all 0.3s',
                }}
              />
              <div style={{ fontSize: '2rem', color: '#FF6B6B', fontWeight: 700 }}>↔</div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: direction === 'right' ? '#FF6B6B' : '#FFB3B3',
                  opacity: direction === 'right' ? 1 : 0.3,
                  transition: 'all 0.3s',
                }}
              />
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FF6B6B', marginBottom: '1rem' }}>
              {Math.floor(duree / 60)}:{String(duree % 60).padStart(2, '0')}
            </div>

            <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1.4rem' }}>
              Cycles: {cycleCount}<br />
              Binaural beats 1Hz actifs<br />
              Stimulation bilatérale synchrone
            </div>

            <p style={{ color: '#666', marginBottom: '1.4rem', fontSize: '0.9rem' }}>
              Pense à {ressource || 'ta ressource'} si tu le souhaites.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={handlePauseReprendre}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: enPause ? '#FF6B6B' : '#F0F0ED',
                  color: enPause ? 'white' : '#222',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {enPause ? '▶️ Reprendre' : '⏸️ Pause'}
              </button>
              <button
                onClick={handleArretTraitement}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#F0F0ED',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Arrêter le traitement
              </button>
            </div>
          </div>
        )}

        {phase === 'post' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Après le traitement</h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Évalue ta détresse maintenant (0-10):
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={sudsApres}
                onChange={(e) => setSudsApres(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FF6B6B', marginTop: '0.4rem' }}>
                SUDS: {sudsApres}/10
              </div>
            </div>

            {sudsApres < sudsAvant && (
              <div style={{
                background: '#E8F5E9',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.4rem',
                color: '#2E7D32',
                fontWeight: 600,
              }}>
                ✓ Amélioration: -{sudsAvant - sudsApres} SUDS
              </div>
            )}

            <button
              onClick={handleSauvegarder}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              Sauvegarder la session
            </button>
          </div>
        )}
      </div>

      <SOSFlottant />
    </div>
  );
}
