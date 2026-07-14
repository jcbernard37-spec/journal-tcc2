import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { TAPPING_EFT, COHERENCE_CARDIAQUE, MEDITATION_BIENVEILLANCE, AFFIRMATIONS_GUIDEES } from '../data/scriptsTherapeutiques';
import { getZenPlayer } from '../lib/zenMusic';
import SOSFlottant from '../lib/SOSFlottant';

type Outil = 'tapping' | 'coherence' | 'meditation' | 'affirmations';

// Scripts importés depuis scriptsTherapeutiques.ts

const OUTILS_CONFIG: Record<Outil, { titre: string; desc: string; icon: string; couleur: string; script: {texte: string; pause: number}[] }> = {
  tapping:      { titre: 'Tapping EFT',         desc: 'Libère le stress point par point', icon: '🫆', couleur: '#FF6B6B', script: TAPPING_EFT },
  coherence:    { titre: 'Cohérence Cardiaque',  desc: '5 min pour réguler le système nerveux', icon: '💓', couleur: '#4ECDC4', script: COHERENCE_CARDIAQUE },
  meditation:   { titre: 'Méditation Bienveillance', desc: 'Metta — cultivar la compassion', icon: '🙏', couleur: '#9D84B7', script: MEDITATION_BIENVEILLANCE },
  affirmations: { titre: 'Affirmations Guidées', desc: 'Renforce tes nouvelles croyances', icon: '✨', couleur: '#FFD93D', script: AFFIRMATIONS_GUIDEES },
};

export default function OutilsBonus() {
  const navigate = useNavigate();
  const [outil, setOutil] = useState<Outil | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres, setProgres] = useState(0);
  const [total, setTotal] = useState(0);
  const [tempsSession, setTempsSession] = useState(0);
  const [texteActuel, setTexteActuel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zenPlayer = getZenPlayer();
  // Outils avec musique de fond (méditation et affirmations)
  const AVEC_MUSIQUE: Outil[] = ['meditation', 'affirmations', 'coherence'];

  useEffect(() => () => { arreter(); zenPlayer.stop(); if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const demarrer = (o: Outil) => {
    setOutil(o);
    const cfg = OUTILS_CONFIG[o];
    setTotal(cfg.script.length);
    setPhase('session');
    intervalRef.current = setInterval(() => setTempsSession(t => t + 1), 1000);

    // Musique + voix depuis le geste utilisateur (fix iOS)
    if (AVEC_MUSIQUE.includes(o)) {
      zenPlayer.play(0.35);
    }
    jouerScriptGuidé(cfg.script, (i, _t, txt) => { setProgres(i); if (txt) setTexteActuel(txt); }, () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      zenPlayer.stop();
      setPhase('apres');
    });
  };

  const togglePause = () => {
    if (enPauseEtat) {
      reprendre();
      if (outil && AVEC_MUSIQUE.includes(outil)) zenPlayer.play(0.35);
      setEnPauseEtat(false);
    } else {
      mettreEnPause();
      zenPlayer.stop();
      setEnPauseEtat(true);
    }
  };

  const sauvegarder = () => {
    const s = { id: Date.now().toString(), type: outil, nom: OUTILS_CONFIG[outil!].titre, duree: Math.round(tempsSession / 60), date: new Date().toISOString(), efficacite: 70 };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    zenPlayer.stop();
    setPhase('choix');
    setOutil(null);
    setTempsSession(0);
    setProgres(0);
  };

  const cfg = outil ? OUTILS_CONFIG[outil] : null;

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌟</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Outils Complémentaires</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>Tapping, cohérence cardiaque, méditation et affirmations — tous guidés par la voix.</p>
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)' }}>{val.desc}</div>
                </div>
                <div style={{ color: val.couleur, fontWeight: 700, fontSize: '1.2rem' }}>▶</div>
              </div>
            ))}
          </div>
        )}

        {phase === 'session' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cfg.icon}</div>
            <h2 style={{ marginBottom: '0.5rem' }}>{cfg.titre}</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>Laisse-toi guider</p>

            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 8, margin: '0 auto 1rem', maxWidth: 300 }}>
              <div style={{ height: 8, borderRadius: '999px', background: cfg.couleur, width: `${total > 0 ? (progres / total) * 100 : 0}%`, transition: 'width 0.5s' }} />
            </div>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.88rem' }}>
              {enPauseEtat ? '⏸ En pause' : `🎙️ ${cfg.titre} en cours...`}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={togglePause} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: 'pointer', color: 'var(--encre)' }}>
                {enPauseEtat ? '▶ Reprendre' : '⏸ Pause'}
              </button>
              <button onClick={() => { arreter(); if (intervalRef.current) clearInterval(intervalRef.current); setPhase('apres'); }}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: 'pointer', color: 'var(--chaud)' }}>
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
