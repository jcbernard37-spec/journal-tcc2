import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { genererSession, iaDisponible } from '../lib/sessionIA';
import { HYPNOSE_RELAXATION, HYPNOSE_CROYANCE, HYPNOSE_RESSOURCE } from '../data/scriptsTherapeutiques';
import { getZenPlayer } from '../lib/zenMusic';
import SOSFlottant from '../lib/SOSFlottant';

type Niveau = 'relaxation' | 'croyance' | 'ressource';

const SCRIPTS = {
  relaxation: HYPNOSE_RELAXATION,
  croyance:   HYPNOSE_CROYANCE,
  ressource:  HYPNOSE_RESSOURCE,
};

const NIVEAUX = {
  relaxation: { label: 'Relaxation profonde',     desc: 'Induction douce — idéal pour débuter',   duree: '~20 min', icon: '🌊' },
  croyance:   { label: 'Transformer une croyance', desc: 'Reprogramme un pattern limitant',        duree: '~25 min', icon: '🔑' },
  ressource:  { label: 'Ancrer une ressource',     desc: 'Accède à ta force intérieure à volonté', duree: '~20 min', icon: '💎' },
};

export default function Hypnose() {
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [ressenti, setRessenti] = useState(5);
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [texteActuel, setTexteActuel] = useState('');
  const [chargementIA, setChargementIA] = useState(false);
  const [progres, setProgres] = useState(0);
  const [total, setTotal] = useState(0);
  const [tempsSession, setTempsSession] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const zenPlayer = getZenPlayer();

  useEffect(() => () => { arreter(); zenPlayer.stop(); if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const demarrer = async () => {
    if (!niveau) return;
    setChargementIA(true);
    const outilMap = { relaxation: 'hypnose_relaxation', croyance: 'hypnose_croyance', ressource: 'hypnose_ressource' };
    const dureeMap = { relaxation: 20, croyance: 25, ressource: 20 };
    const { segments } = await genererSession(outilMap[niveau], dureeMap[niveau], SCRIPTS[niveau]);
    setChargementIA(false);
    const script = segments;
    setTotal(script.length);
    setPhase('session');
    intervalRef.current = setInterval(() => setTempsSession(t => t + 1), 1000);
    zenPlayer.play(0.3);
    jouerScriptGuidé(script, (i, _t, txt) => { setProgres(i); if (txt) setTexteActuel(txt); }, () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      zenPlayer.stop();
      setPhase('apres');
    });
  };

  const togglePause = () => {
    if (enPauseEtat) { reprendre(); zenPlayer.play(0.3); setEnPauseEtat(false); }
    else { mettreEnPause(); zenPlayer.stop(); setEnPauseEtat(true); }
  };

  const sauvegarder = () => {
    const s = {
      id: Date.now().toString(), type: 'hypnose',
      nom: NIVEAUX[niveau!].label,
      duree: Math.round(tempsSession / 60) || 1,
      date: new Date().toISOString(),
      efficacite: ressenti * 10,
    };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => { arreter(); zenPlayer.stop(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌀</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Hypnose Ericksonienne</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>Induction guidée par la voix + musique zen. Laisse-toi porter.</p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Choisis ta session</h2>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(Object.entries(NIVEAUX) as [Niveau, typeof NIVEAUX.relaxation][]).map(([key, val]) => (
                <div key={key} onClick={() => setNiveau(key)}
                  style={{ padding: '1.1rem 1.25rem', border: `2px solid ${niveau === key ? '#9D84B7' : 'var(--carte-border)'}`, borderRadius: '12px', cursor: 'pointer', background: niveau === key ? 'rgba(157,132,183,0.1)' : 'transparent', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>{val.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--encre)' }}>{val.label}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--encre-3)' }}>{val.desc} · {val.duree}</div>
                    </div>
                    {niveau === key && <span style={{ marginLeft: 'auto', color: '#9D84B7', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(157,132,183,0.1)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: '#7A5FA0', fontSize: '0.88rem' }}>
              🎙️ Voix guidée + musique zen démarrent au clic. Monte le volume de ton appareil.
            </div>
            <button onClick={() => niveau && demarrer()} disabled={!niveau}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: niveau ? '#9D84B7' : 'var(--carte-border)', color: niveau ? 'white' : 'var(--encre-3)', border: 'none', fontWeight: 700, cursor: niveau ? 'pointer' : 'default' }}>
              {chargementIA ? '✨ Solco prépare ta session…' : '🎙️ Commencer l\'induction'}
            </button>
          </div>
        )}

        {phase === 'session' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem' }}>Induction en cours</h2>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #9D84B7', margin: '0 auto 1.5rem', animation: enPauseEtat ? 'none' : 'spin 8s linear infinite', opacity: enPauseEtat ? 0.4 : 1 }} />
            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 6, margin: '0 auto 0.75rem', maxWidth: 280 }}>
              <div style={{ height: 6, borderRadius: '999px', background: '#9D84B7', width: `${total > 0 ? (progres / total) * 100 : 0}%`, transition: 'width 0.5s' }} />
            </div>
            {texteActuel && !enPauseEtat && (
              <div style={{ background: 'rgba(157,132,183,0.12)', borderRadius: '10px', padding: '0.85rem 1rem', margin: '0.75rem auto 1rem', maxWidth: 340, color: '#7A5FA0', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                「{texteActuel}」
              </div>
            )}
            <p style={{ color: 'var(--encre-3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {enPauseEtat ? '⏸ En pause' : '🎙️ Guidance vocale en cours...'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={togglePause} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: 'pointer', color: 'var(--encre)' }}>
                {enPauseEtat ? '▶ Reprendre' : '⏸ Pause'}
              </button>
              <button onClick={() => { arreter(); zenPlayer.stop(); if (intervalRef.current) clearInterval(intervalRef.current); setPhase('apres'); }}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: 'pointer', color: 'var(--chaud)' }}>
                Terminer
              </button>
            </div>
          </div>
        )}

        {phase === 'apres' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ marginBottom: '1.25rem' }}>Comment tu te sens ? 🌀</h2>
            <input type="range" min={0} max={10} value={ressenti} onChange={e => setRessenti(+e.target.value)} style={{ width: '100%', accentColor: '#9D84B7', marginBottom: '0.5rem' }} />
            <div style={{ textAlign: 'center', fontWeight: 700, color: '#9D84B7', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{ressenti}/10</div>
            <button onClick={sauvegarder} style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#9D84B7', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Sauvegarder
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <SOSFlottant />
    </div>
  );
}
