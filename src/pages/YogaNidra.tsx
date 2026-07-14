import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { YOGA_NIDRA_COURT, YOGA_NIDRA_MOYEN, YOGA_NIDRA_LONG } from '../data/scriptsTherapeutiques';
import type { Segment } from '../data/scriptsTherapeutiques';
import { getZenPlayer } from '../lib/zenMusic';
import SOSFlottant from '../lib/SOSFlottant';

type Duree = 'court' | 'moyen' | 'long';

const SCRIPTS: Record<'court' | 'moyen' | 'long', Segment[]> = {
  court: YOGA_NIDRA_COURT,
  moyen: YOGA_NIDRA_MOYEN,   // "La Rivière qui Rentre à la Mer" — script complet
  long:  YOGA_NIDRA_LONG,
};



export default function YogaNidra() {
  const navigate = useNavigate();
  const [duree, setDuree] = useState<Duree | null>(null);
  const [phase, setPhase] = useState<'choix' | 'avant' | 'session' | 'apres'>('choix');
  const [avantScore, setAvantScore] = useState(5);
  const [apresScore, setApresScore] = useState(5);
  const [enCours, setEnCours] = useState(false);
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres, setProgres] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [tempsSession, setTempsSession] = useState(0);
  const [texteActuel, setTexteActuel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const options = {
    court: { label: '15 min', desc: 'Pause rapide et régénérante' },
    moyen: { label: '30 min', desc: 'Session complète et profonde' },
    long:  { label: '60 min', desc: 'Immersion thérapeutique totale' },
  };

  useEffect(() => {
    return () => {
      arreter();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const [volumeMusique, setVolumeMusique] = useState(0.4);
  const zenPlayer = getZenPlayer();

  const demarrer = () => {
    if (!duree) return;
    const script = SCRIPTS[duree];
    setTotalSegments(script.length);
    setProgres(0);
    setEnCours(true);
    setPhase('session');

    // Musique + voix depuis le geste utilisateur (fix iOS)
    zenPlayer.play(volumeMusique);
    jouerScriptGuidé(
      script,
      (index, _total, texte) => { setProgres(index); if (texte) setTexteActuel(texte); },
      () => {
        setEnCours(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        zenPlayer.stop();
        setPhase('apres');
      }
    );

    intervalRef.current = setInterval(() => {
      setTempsSession(t => t + 1);
    }, 1000);
  };

  const togglePause = () => {
    if (enPauseEtat) {
      reprendre();
      zenPlayer.play(volumeMusique);
      setEnPauseEtat(false);
    } else {
      mettreEnPause();
      zenPlayer.stop();
      setEnPauseEtat(true);
    }
  };

  const terminer = () => {
    arreter();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setEnCours(false);
    setPhase('apres');
  };

  const sauvegarder = () => {
    const session = {
      id: Date.now().toString(),
      type: 'yoga_nidra',
      nom: `Yoga Nidra ${options[duree!].label}`,
      duree: Math.round(tempsSession / 60),
      date: new Date().toISOString(),
      efficacite: Math.max(0, (apresScore - avantScore) * 15 + 50),
      avantApres: { avant: avantScore, apres: apresScore },
    };
    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);
    sessions.push(session);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(sessions));
    navigate('/outils-therapeutiques');
  };

  const formatTemps = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>

        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧘</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Yoga Nidra</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>
            Relaxation guidée profonde. La voix t'accompagne tout au long de la session — tu n'as rien à faire.
          </p>
        </div>

        {/* CHOIX DURÉE */}
        {phase === 'choix' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Choisis ta durée</h2>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(Object.entries(options) as [Duree, typeof options.court][]).map(([key, val]) => (
                <div key={key} onClick={() => setDuree(key)}
                  style={{
                    padding: '1.1rem 1.25rem',
                    border: `2px solid ${duree === key ? 'var(--accent)' : 'var(--carte-border)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: duree === key ? 'var(--accent-pale)' : 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s',
                  }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--encre)' }}>{val.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)' }}>{val.desc}</div>
                  </div>
                  {duree === key && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
            <button onClick={() => duree && setPhase('avant')} disabled={!duree}
              style={{
                width: '100%', padding: '1rem', borderRadius: '999px',
                background: duree ? 'var(--accent)' : 'var(--carte-border)',
                color: duree ? 'white' : 'var(--encre-3)',
                border: 'none', fontWeight: 700, fontSize: '1rem', cursor: duree ? 'pointer' : 'default',
              }}>
              Continuer →
            </button>
          </div>
        )}

        {/* AVANT */}
        {phase === 'avant' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Avant la session</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.25rem' }}>Comment tu te sens en ce moment ?</p>

            <input type="range" min={0} max={10} value={avantScore}
              onChange={e => setAvantScore(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Épuisée</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>{avantScore}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Pleine d'énergie</span>
            </div>

            <div style={{ background: 'var(--accent-pale)', padding: '1.1rem', borderRadius: '10px', marginBottom: '1rem', color: 'var(--accent-fonce)', fontSize: '0.9rem' }}>
              🎵 Musique zen générée + 🎙️ voix guidée démarrent automatiquement.
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--encre-2)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>🎵 Volume musique de fond</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{Math.round(volumeMusique * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={volumeMusique}
                onChange={e => setVolumeMusique(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setPhase('choix')}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 600, cursor: 'pointer', color: 'var(--encre-2)' }}>
                Retour
              </button>
              <button onClick={demarrer}
                style={{ flex: 2, padding: '0.9rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                🎙️ Commencer la guidance
              </button>
            </div>
          </div>
        )}

        {/* SESSION EN COURS */}
        {phase === 'session' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Yoga Nidra en cours</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ferme les yeux et laisse-toi guider</p>

            {/* Animation */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'var(--accent)', margin: '0 auto 1.5rem',
              animation: enPauseEtat ? 'none' : 'pulse 4s ease-in-out infinite',
              opacity: enPauseEtat ? 0.4 : 1,
              transition: 'opacity 0.3s',
            }} />

            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>
              {formatTemps(tempsSession)}
            </div>

            {/* Barre de progression */}
            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 6, margin: '0 auto 1.5rem', maxWidth: 300 }}>
              <div style={{
                height: 6, borderRadius: '999px', background: 'var(--accent)',
                width: `${totalSegments > 0 ? (progres / totalSegments) * 100 : 0}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>

            <p style={{ color: 'var(--encre-2)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {enPauseEtat ? '⏸ En pause' : '🎵 Musique zen  ·  🎙️ Voix guidée'}
            </p>

            {/* Texte courant visible */}
            {texteActuel && !enPauseEtat && (
              <div style={{
                background: 'var(--accent-pale)',
                borderRadius: '10px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.25rem',
                color: 'var(--accent-fonce)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                「{texteActuel}」
              </div>
            )}

            <div style={{ maxWidth: 260, margin: '0 auto 1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--encre-3)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>🎵 Musique</span>
                <span>{Math.round(volumeMusique * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={volumeMusique}
                onChange={e => { setVolumeMusique(+e.target.value); zenPlayer.setVolume(+e.target.value); }}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={togglePause}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: 'pointer', color: 'var(--encre)' }}>
                {enPauseEtat ? '▶ Reprendre' : '⏸ Pause'}
              </button>
              <button onClick={terminer}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: 'pointer', color: 'var(--chaud)' }}>
                Terminer
              </button>
            </div>
          </div>
        )}

        {/* APRÈS */}
        {phase === 'apres' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Session terminée 🌿</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.25rem' }}>Durée : {formatTemps(tempsSession)}</p>

            <p style={{ color: 'var(--encre-2)', marginBottom: '0.75rem' }}>Comment tu te sens maintenant ?</p>
            <input type="range" min={0} max={10} value={apresScore}
              onChange={e => setApresScore(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Épuisée</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>{apresScore}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Pleine d'énergie</span>
            </div>

            {apresScore > avantScore && (
              <div style={{ background: 'var(--accent-pale)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: 'var(--accent-fonce)', fontWeight: 600 }}>
                ✓ +{apresScore - avantScore} points — belle progression !
              </div>
            )}

            <button onClick={sauvegarder}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
              Sauvegarder et terminer
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
      <SOSFlottant />
    </div>
  );
}
