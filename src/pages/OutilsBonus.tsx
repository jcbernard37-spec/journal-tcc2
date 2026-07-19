import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loadUserProfile,
  generatePersonalizedTapping,
  generatePersonalizedCoherence,
  generatePersonalizedMeditation,
  generatePersonalizedAffirmations,
} from '../lib/iaPersonnalisee';
import { textToSpeech } from '../lib/elevenLabs';
import { debloquerAudio } from '../lib/iosAudioUnlock';
import { sauvegarderDansBibliotheque, urlVersBlob } from '../lib/bibliotheque';
import { getZenPlayer } from '../lib/zenMusic';
import { stockage } from '../lib/storage';
import SOSFlottant from '../lib/SOSFlottant';

type Outil = 'tapping' | 'coherence' | 'meditation' | 'affirmations';

const OUTILS_CONFIG: Record<Outil, { titre: string; desc: string; icon: string; couleur: string; dureeMin: number }> = {
  tapping:      { titre: 'Tapping EFT',              desc: 'Libère le stress point par point',      icon: '🫆', couleur: '#FF6B6B', dureeMin: 10 },
  coherence:    { titre: 'Cohérence Cardiaque',       desc: '5 min pour réguler le système nerveux', icon: '💓', couleur: '#4ECDC4', dureeMin: 5 },
  meditation:   { titre: 'Méditation Bienveillance',  desc: 'Metta — cultiver la compassion',        icon: '🙏', couleur: '#9D84B7', dureeMin: 20 },
  affirmations: { titre: 'Affirmations Guidées',      desc: 'Renforce tes nouvelles croyances',      icon: '✨', couleur: '#FFD93D', dureeMin: 10 },
};

const GENERATEURS: Record<Outil, (profile: ReturnType<typeof loadUserProfile>) => Promise<string>> = {
  tapping: generatePersonalizedTapping,
  coherence: generatePersonalizedCoherence,
  meditation: generatePersonalizedMeditation,
  affirmations: generatePersonalizedAffirmations,
};

// Outils avec musique de fond douce derrière la voix
const AVEC_MUSIQUE: Outil[] = ['meditation', 'affirmations', 'coherence'];

export default function OutilsBonus() {
  const navigate = useNavigate();
  const [outil, setOutil] = useState<Outil | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [isLoading, setIsLoading] = useState(false);
  const [enPause, setEnPause] = useState(false);
  const [erreurGeneration, setErreurGeneration] = useState(false);
  const [erreurMessage, setErreurMessage] = useState('');
  const [tempsSession, setTempsSession] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  // Rythme de respiration pour la Cohérence Cardiaque — piloté par un
  // minuteur PRÉCIS, indépendant de la voix (qui ne peut pas garantir un
  // timing exact à la seconde près). C'est ce cercle, pas la voix, qui
  // donne le vrai rythme 5s inspire / 5s expire.
  const [respirPhase, setRespirPhase] = useState<'inspire' | 'expire'>('inspire');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const respirIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zenPlayer = getZenPlayer();

  // Coupe systématiquement le son si l'utilisateur quitte la page.
  useEffect(() => {
    return () => {
      audioPlayer?.pause();
      zenPlayer.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (respirIntervalRef.current) clearInterval(respirIntervalRef.current);
    };
  }, [audioPlayer]);

  const demarrer = async (o: Outil) => {
    // Empêche un double-clic / double-tap de lancer DEUX générations en
    // parallèle, chacune avec sa propre voix qui se superposerait à l'autre.
    if (phase === 'session' || isLoading) return;

    // Coupe tout audio résiduel d'une session précédente avant d'en
    // démarrer une nouvelle (sécurité supplémentaire).
    audioPlayer?.pause();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (respirIntervalRef.current) clearInterval(respirIntervalRef.current);

    // 🔓 Débloque l'audio AVANT tout await — indispensable sur iOS Safari.
    const audio = debloquerAudio();
    setAudioPlayer(audio);
    if (AVEC_MUSIQUE.includes(o)) zenPlayer.play(0.35);

    setOutil(o);
    setIsLoading(true);
    setErreurGeneration(false);
    setErreurMessage('');
    setEnPause(false);
    setTempsSession(0);
    setPhase('session');

    // Le cercle de respiration démarre immédiatement, indépendamment de la
    // voix — c'est LUI qui donne le vrai rythme précis (5s / 5s), pas la
    // synthèse vocale qui ne peut pas garantir un timing exact à la seconde.
    if (o === 'coherence') {
      setRespirPhase('inspire');
      if (respirIntervalRef.current) clearInterval(respirIntervalRef.current);
      respirIntervalRef.current = setInterval(() => {
        setRespirPhase(prev => (prev === 'inspire' ? 'expire' : 'inspire'));
      }, 5000);
    }

    try {
      const profile = loadUserProfile();
      const script = await GENERATEURS[o](profile);
      const url = await textToSpeech(script);

      if (!url) {
        setErreurGeneration(true);
        return;
      }

      audio.src = url;
      audio.play().catch(err => console.error('Error playing audio:', err));

      // Une fois la voix terminée, on arrête proprement (sinon la musique
      // de fond continuerait seule indéfiniment).
      audio.onended = () => terminer();

      // Ajoute automatiquement cette séance à la bibliothèque.
      urlVersBlob(url)
        .then(blob => sauvegarderDansBibliotheque(o, OUTILS_CONFIG[o].titre, OUTILS_CONFIG[o].dureeMin, script, blob))
        .catch(() => {});

      intervalRef.current = setInterval(() => {
        setTempsSession(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error generating bonus session:', error);
      setErreurMessage(error instanceof Error ? error.message : '');
      setErreurGeneration(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePause = () => {
    if (!audioPlayer) return;

    if (enPause) {
      audioPlayer.play().catch(err => console.error('Error resuming audio:', err));
      if (outil && AVEC_MUSIQUE.includes(outil)) zenPlayer.play(0.35);
      intervalRef.current = setInterval(() => setTempsSession(t => t + 1), 1000);
      if (outil === 'coherence') {
        setRespirPhase('inspire');
        respirIntervalRef.current = setInterval(() => {
          setRespirPhase(prev => (prev === 'inspire' ? 'expire' : 'inspire'));
        }, 5000);
      }
      setEnPause(false);
    } else {
      audioPlayer.pause();
      zenPlayer.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (respirIntervalRef.current) clearInterval(respirIntervalRef.current);
      setEnPause(true);
    }
  };

  const terminer = () => {
    audioPlayer?.pause();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (respirIntervalRef.current) clearInterval(respirIntervalRef.current);
    setPhase('apres');
  };

  const sauvegarder = () => {
    stockage.ajouterEntree(outil!, {
      nom: OUTILS_CONFIG[outil!].titre,
      duree_minutes: Math.round(tempsSession / 60),
      efficacite: 70,
    });
    setPhase('choix');
    setOutil(null);
    setTempsSession(0);
  };

  const handleRetour = () => {
    audioPlayer?.pause();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate('/outils-therapeutiques');
  };

  const cfg = outil ? OUTILS_CONFIG[outil] : null;

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={handleRetour}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌟</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Outils Complémentaires</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>
            Tapping, cohérence cardiaque, méditation et affirmations — voix personnalisée
            générée pour toi, comme les autres outils.
          </p>
        </div>

        {phase === 'choix' && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(Object.entries(OUTILS_CONFIG) as [Outil, typeof OUTILS_CONFIG.tapping][]).map(([key, val]) => (
              <div key={key} onClick={() => demarrer(key)}
                style={{ background: 'var(--carte-bg)', border: '1px solid var(--carte-border)', borderRadius: '14px', padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'transform 0.15s', boxShadow: 'var(--ombre)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${val.couleur}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                  {val.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--encre)', marginBottom: '0.2rem' }}>{val.titre}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)' }}>{val.desc} · {val.dureeMin} min</div>
                </div>
                <div style={{ color: val.couleur, fontWeight: 700, fontSize: '1.2rem' }}>▶</div>
              </div>
            ))}
          </div>
        )}

        {phase === 'session' && cfg && erreurGeneration && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Un souci technique</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.4rem' }}>
              {erreurMessage || `La génération de ta session ${cfg.titre} n'a pas fonctionné cette fois-ci. Rien n'est perdu — tu peux réessayer.`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => { setPhase('choix'); setOutil(null); }}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: 'pointer', color: 'var(--encre)' }}>
                Retour
              </button>
              <button onClick={() => demarrer(outil!)}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: cfg.couleur, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Réessayer
              </button>
            </div>
          </div>
        )}

        {phase === 'session' && cfg && !erreurGeneration && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            {outil === 'coherence' ? (
              <div style={{ margin: '0 auto 1rem', width: 170, height: 170, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: respirPhase === 'inspire' && !enPause ? 160 : 70,
                  height: respirPhase === 'inspire' && !enPause ? 160 : 70,
                  borderRadius: '50%',
                  background: `${cfg.couleur}30`,
                  border: `3px solid ${cfg.couleur}`,
                  transition: enPause ? 'none' : 'width 5s ease-in-out, height 5s ease-in-out',
                }} />
                <div style={{ position: 'absolute', fontWeight: 700, color: cfg.couleur, fontSize: '1.05rem' }}>
                  {enPause ? '⏸' : respirPhase === 'inspire' ? 'Inspire…' : 'Expire…'}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cfg.icon}</div>
            )}
            <h2 style={{ marginBottom: '0.5rem' }}>{cfg.titre}</h2>

            {isLoading ? (
              <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Ta voix personnalisée se prépare, quelques instants...
                {outil === 'coherence' && ' Suis déjà le cercle ci-dessus, il est réglé au bon rythme.'}
              </p>
            ) : (
              <>
                <div style={{
                  fontSize: '1.8rem', fontWeight: 700, color: cfg.couleur, margin: '1rem 0',
                }}>
                  {Math.floor(tempsSession / 60)}:{String(tempsSession % 60).padStart(2, '0')}
                </div>
                <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.88rem' }}>
                  {enPause ? '⏸ En pause' : `🎙️ ${cfg.titre} en cours...`}
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={togglePause} disabled={isLoading}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: enPause ? cfg.couleur : 'var(--bg-2)', color: enPause ? 'white' : 'var(--encre)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.5 : 1 }}>
                {enPause ? '▶ Reprendre' : '⏸ Pause'}
              </button>
              <button onClick={terminer} disabled={isLoading}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: isLoading ? 'default' : 'pointer', color: 'var(--chaud)', opacity: isLoading ? 0.5 : 1 }}>
                Terminer
              </button>
            </div>
          </div>
        )}

        {phase === 'apres' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Session terminée</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.5rem' }}>{cfg.titre} · {Math.round(tempsSession / 60)} min</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={sauvegarder} style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: cfg.couleur, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Sauvegarder
              </button>
              <button onClick={() => { setPhase('choix'); setOutil(null); setTempsSession(0); }}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 600, cursor: 'pointer', color: 'var(--encre-2)' }}>
                Autre outil
              </button>
            </div>
          </div>
        )}
      </div>
    <SOSFlottant />
    </div>
  );
}
