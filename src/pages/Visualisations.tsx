import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { VIZ_ABONDANCE, VIZ_GUERISON, VIZ_ENFANT, VIZ_RESSOURCES, VIZ_SAFE, VIZ_DIALOGUE } from '../data/scriptsTherapeutiques';
import { getZenPlayer } from '../lib/zenMusic';
import SOSFlottant from '../lib/SOSFlottant';

type VisuType = 'abondance' | 'guerison' | 'enfant' | 'ressources' | 'safe' | 'dialogue';

const SCRIPTS = {
  abondance:  VIZ_ABONDANCE,
  guerison:   VIZ_GUERISON,
  enfant:     VIZ_ENFANT,
  ressources: VIZ_RESSOURCES,
  safe:       VIZ_SAFE,
  dialogue:   VIZ_DIALOGUE,
};

const CONFIG: Record<VisuType, { titre: string; desc: string; duree: string; icon: string; couleur: string }> = {
  abondance: { titre: 'Abondance & Manifestation', desc: 'Visualise et attire ce que tu veux', duree: '30 min', icon: '🌟', couleur: '#FFD93D' },
  guerison:  { titre: 'Guérison Émotionnelle',     desc: 'Pardonne et libère les blessures',  duree: '40 min', icon: '💛', couleur: '#FF9F43' },
  enfant:    { titre: 'Enfant Intérieur',           desc: 'Rencontre et soigne ta version enfant', duree: '45 min', icon: '🌱', couleur: '#6BCF7F' },
  ressources:{ titre: 'Ressources Futures',         desc: 'Visualise ta force et ton succès', duree: '25 min', icon: '🚀', couleur: '#4ECDC4' },
  safe:      { titre: 'Safe Place',                 desc: 'Crée ton sanctuaire intérieur',    duree: '20 min', icon: '🏝️', couleur: '#45B7D1' },
  dialogue:  { titre: 'Dialogue Transformateur',    desc: 'Parle à tes parties intérieures', duree: '50 min', icon: '🌀', couleur: '#9D84B7' },
};

export default function Visualisations() {
  const navigate = useNavigate();
  const [type,        setType]        = useState<VisuType | null>(null);
  const [phase,       setPhase]       = useState<'choix' | 'session' | 'apres'>('choix');
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres,     setProgres]     = useState(0);
  const [total,       setTotal]       = useState(0);
  const [tempsMin,    setTempsMin]    = useState(0);
  const [ressenti,    setRessenti]    = useState(7);
  const [volMusique,  setVolMusique]  = useState(0.35);
  const [texteActuel, setTexteActuel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const zenPlayer   = getZenPlayer();

  useEffect(() => () => {
    arreter();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // ── Démarre la session — DOIT être appelé directement depuis onClick ──
  const demarrer = (t: VisuType) => {
    setType(t);
    setPhase('session');
    setProgres(0);

    const script = SCRIPTS[t];
    setTotal(script.length);

    // 1. Musique zen (AudioContext depuis geste utilisateur ✓)
    zenPlayer.play(volMusique);

    // 2. Voix immédiatement — PAS de setTimeout (fix iOS critique)
    jouerScriptGuidé(
      script,
      (i, _t, txt) => { setProgres(i); if (txt) setTexteActuel(txt); },
      () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        zenPlayer.stop();
        setPhase('apres');
      }
    );

    // Timer
    intervalRef.current = setInterval(() => setTempsMin(m => m + 1), 60000);
  };

  const togglePause = () => {
    if (enPauseEtat) {
      reprendre();
      zenPlayer.play(volMusique);
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
    setPhase('apres');
  };

  const sauvegarder = () => {
    const s = {
      id: Date.now().toString(), type: 'visualisation',
      nom: type ? CONFIG[type].titre : '',
      duree: tempsMin, date: new Date().toISOString(),
      efficacite: ressenti * 10,
    };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    navigate('/outils-therapeutiques');
  };

  const cfg = type ? CONFIG[type] : null;

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>

        <button onClick={() => { arreter(); zenPlayer.stop(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌈</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Visualisations Créatrices</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>
            6 voyages guidés. Voix + musique zen inclus. Ferme les yeux et laisse-toi porter.
          </p>
        </div>

        {/* ── CHOIX ── */}
        {phase === 'choix' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Choisis ta visualisation</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(Object.entries(CONFIG) as [VisuType, typeof CONFIG.abondance][]).map(([key, val]) => (
                <div key={key} onClick={() => setType(key)}
                  style={{
                    padding: '1.25rem 1rem',
                    border: `2px solid ${type === key ? val.couleur : 'var(--carte-border)'}`,
                    borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                    background: type === key ? `${val.couleur}18` : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{val.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--encre)', marginBottom: '0.3rem' }}>{val.titre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--encre-3)' }}>{val.duree}</div>
                </div>
              ))}
            </div>

            {type && (
              <div style={{ background: `${CONFIG[type].couleur}18`, padding: '0.9rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--encre-2)' }}>
                🎙️ <strong>{CONFIG[type].titre}</strong> — {CONFIG[type].desc}
                <br />Musique zen + voix guidée démarrent automatiquement dès que tu cliques.
              </div>
            )}

            <button onClick={() => type && demarrer(type)} disabled={!type}
              style={{
                width: '100%', padding: '1.1rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 700, border: 'none',
                background: type ? (CONFIG[type]?.couleur || 'var(--accent)') : 'var(--carte-border)',
                color: type ? '#111' : 'var(--encre-3)',
                cursor: type ? 'pointer' : 'default',
              }}>
              🎙️ Commencer la visualisation
            </button>
          </div>
        )}

        {/* ── SESSION ── */}
        {phase === 'session' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cfg.icon}</div>
            <h2 style={{ marginBottom: '0.3rem' }}>{cfg.titre}</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>Ferme les yeux · Laisse-toi guider</p>

            {/* Animation */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.couleur}, ${cfg.couleur}99)`,
              margin: '0 auto 1.5rem',
              animation: enPauseEtat ? 'none' : 'pulse 4s ease-in-out infinite',
              opacity: enPauseEtat ? 0.4 : 1,
            }} />

            {/* Barre progression */}
            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 6, maxWidth: 280, margin: '0 auto 0.75rem' }}>
              <div style={{ height: 6, borderRadius: '999px', background: cfg.couleur, width: `${total > 0 ? (progres / total) * 100 : 0}%`, transition: 'width 0.5s' }} />
            </div>

            <p style={{ color: 'var(--encre-3)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              {enPauseEtat ? '⏸ En pause' : '🎵 Musique zen  ·  🎙️ Voix guidée'}
            </p>

            {/* Texte live */}
            {texteActuel && !enPauseEtat && (
              <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', fontStyle: 'italic', textAlign: 'center', color: 'var(--encre-2)', lineHeight: 1.5 }}>
                「{texteActuel}」
              </div>
            )}

            {/* Volume musique */}
            <div style={{ maxWidth: 240, margin: '0 auto 1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--encre-3)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>🎵 Musique</span>
                <span>{Math.round(volMusique * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={volMusique}
                onChange={e => { setVolMusique(+e.target.value); zenPlayer.setVolume(+e.target.value); }}
                style={{ width: '100%', accentColor: cfg.couleur }} />
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

        {/* ── APRÈS ── */}
        {phase === 'apres' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Visualisation terminée ✨</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>{cfg.titre}</p>

            <p style={{ color: 'var(--encre-2)', marginBottom: '0.75rem' }}>Qu'as-tu ressenti ? (0–10)</p>
            <input type="range" min={0} max={10} value={ressenti}
              onChange={e => setRessenti(+e.target.value)}
              style={{ width: '100%', accentColor: cfg.couleur, marginBottom: '0.5rem' }} />
            <div style={{ textAlign: 'center', fontWeight: 700, color: cfg.couleur, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {ressenti}/10
            </div>

            <button onClick={sauvegarder}
              style={{ width: '100%', padding: '1.1rem', borderRadius: '999px', background: cfg.couleur, color: '#111', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Sauvegarder
            </button>
          </div>
        )}
      </div>

      <SOSFlottant />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
