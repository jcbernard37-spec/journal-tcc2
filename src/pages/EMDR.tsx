import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jouerScriptGuidé, arreter } from '../lib/voiceGuide';
import { EMDR_GUIDANCE } from '../data/scriptsTherapeutiques';
import { stockage } from '../lib/storage';
import SOSFlottant from '../lib/SOSFlottant';

type Phase = 'disclaimer' | 'suds' | 'processing' | 'post';

const SCRIPT_EMDR = EMDR_GUIDANCE;

export default function EMDR() {
  const navigate = useNavigate();
  const [phase, setPhase]     = useState<Phase>('disclaimer');
  const [sudsAvant, setSudsAvant] = useState(5);
  const [sudsApres, setSudsApres] = useState(5);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [duree, setDuree]     = useState(0);
  const [cycles, setCycles]   = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dirIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    arreter();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (dirIntervalRef.current) clearInterval(dirIntervalRef.current);
  }, []);

  const demarrerTraitement = () => {
    setPhase('processing');
    setIsRunning(true);

    // Voix guidée EMDR — depuis le geste utilisateur (fix iOS)
    jouerScriptGuidé(SCRIPT_EMDR, undefined, () => {
      stopProcessing();
      setPhase('post');
    });

    // Animation bilatérale 1Hz
    dirIntervalRef.current = setInterval(() =>
      setDirection(d => d === 'left' ? 'right' : 'left'), 500);

    // Timer
    intervalRef.current = setInterval(() => {
      setDuree(d => d + 1);
      setCycles(c => c + 1);
    }, 1000);
  };

  const stopProcessing = () => {
    setIsRunning(false);
    if (dirIntervalRef.current) clearInterval(dirIntervalRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleArret = () => {
    arreter();
    stopProcessing();
    setPhase('post');
  };

  const sauvegarder = () => {
    const amelioration = sudsAvant - sudsApres;
    stockage.ajouterEntree('emdr', {
      nom: 'Session EMDR Bilatérale',
      duree_minutes: Math.round(duree / 60) || 1,
      efficacite: Math.max(0, Math.min(100, amelioration * 10 + 50)),
      suds_avant: sudsAvant,
      suds_apres: sudsApres,
    });
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
          <h1 style={{ marginBottom: '0.5rem' }}>EMDR — Stimulation Bilatérale</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>Animation visuelle + voix guidée + binaural 1Hz.</p>
        </div>

        {/* ── DISCLAIMER ── */}
        {phase === 'disclaimer' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Avant de commencer</h2>

            <p style={{ color: 'var(--encre-2)', marginBottom: '1rem', lineHeight: 1.6 }}>
              L'EMDR est une technique thérapeutique <strong>scientifiquement validée</strong> pour le traitement des peurs, des traumatismes et des souvenirs douloureux.
            </p>

            <div style={{ background: 'var(--chaud-pale)', border: '1px solid color-mix(in srgb, var(--chaud) 30%, transparent)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', color: 'var(--chaud)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <strong>⚠️ Important :</strong> Cet outil est adapté aux peurs et préoccupations du quotidien.
              Si tu traverses un <strong>trauma sévère</strong> (agression, accident grave, deuil récent),
              il est fortement recommandé de travailler avec un <strong>professionnel EMDR certifié</strong>.
            </div>

            <p style={{ color: 'var(--encre-3)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Si à tout moment tu te sens en détresse, le bouton <strong>SOS</strong> est disponible en bas à droite de l'écran.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/sos" style={{ flex: 1 }}>
                <button style={{ width: '100%', padding: '0.9rem', borderRadius: '999px', background: 'var(--crise-pale)', border: '1.5px solid var(--crise)', color: 'var(--crise)', fontWeight: 700, cursor: 'pointer' }}>
                  Aller vers SOS
                </button>
              </Link>
              <button onClick={() => setPhase('suds')}
                style={{ flex: 2, padding: '0.9rem', borderRadius: '999px', background: '#FF6B6B', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Je comprends — Continuer
              </button>
            </div>
          </div>
        )}

        {/* ── SUDS AVANT ── */}
        {phase === 'suds' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Évalue ta détresse (SUDS)</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.25rem', fontSize: '0.93rem' }}>
              Pense au souvenir ou à la peur que tu veux traiter. Sur 10, quelle est son intensité en ce moment ?
            </p>
            <input type="range" min={0} max={10} value={sudsAvant}
              onChange={e => setSudsAvant(+e.target.value)}
              style={{ width: '100%', accentColor: '#FF6B6B', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Aucune détresse</span>
              <span style={{ fontWeight: 800, color: '#FF6B6B', fontSize: '1.2rem' }}>{sudsAvant}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Détresse max</span>
            </div>
            <div style={{ background: 'var(--accent-pale)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: 'var(--accent-fonce)', fontSize: '0.88rem' }}>
              🎙️ Une voix te guidera pendant la stimulation. Monte le volume de ton appareil.
            </div>
            <button onClick={demarrerTraitement}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#FF6B6B', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              🎯 Commencer le traitement
            </button>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'processing' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Traitement en cours</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.88rem' }}>
              Suis le mouvement avec tes yeux · Observe ce qui vient
            </p>

            {/* Animation bilatérale */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', marginBottom: '2.5rem', height: '120px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: direction === 'left' ? '#FF6B6B' : 'var(--bg-2)',
                transform: direction === 'left' ? 'scale(1.15)' : 'scale(0.85)',
                transition: 'all 0.25s ease-out',
                boxShadow: direction === 'left' ? '0 0 24px #FF6B6B80' : 'none',
              }} />
              <div style={{ color: 'var(--encre-3)', fontSize: '1.2rem' }}>↔</div>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: direction === 'right' ? '#FF6B6B' : 'var(--bg-2)',
                transform: direction === 'right' ? 'scale(1.15)' : 'scale(0.85)',
                transition: 'all 0.25s ease-out',
                boxShadow: direction === 'right' ? '0 0 24px #FF6B6B80' : 'none',
              }} />
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF6B6B', marginBottom: '0.5rem' }}>
              {Math.floor(duree / 60)}:{String(duree % 60).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--encre-3)', marginBottom: '2rem' }}>
              🎙️ Voix guidée active · {cycles} cycles bilatéraux
            </div>

            <button onClick={handleArret}
              style={{ padding: '0.9rem 2rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 600, cursor: 'pointer', color: 'var(--encre)' }}>
              Arrêter le traitement
            </button>
          </div>
        )}

        {/* ── POST ── */}
        {phase === 'post' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Après le traitement</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.25rem', fontSize: '0.93rem' }}>
              Prends une grande respiration. Pense maintenant au souvenir ou à la peur initiale. Quelle est son intensité ?
            </p>
            <input type="range" min={0} max={10} value={sudsApres}
              onChange={e => setSudsApres(+e.target.value)}
              style={{ width: '100%', accentColor: '#FF6B6B', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Aucune détresse</span>
              <span style={{ fontWeight: 800, color: '#FF6B6B', fontSize: '1.2rem' }}>{sudsApres}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Détresse max</span>
            </div>

            {sudsApres < sudsAvant && (
              <div style={{ background: 'var(--accent-pale)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.25rem', color: 'var(--accent-fonce)', fontWeight: 600 }}>
                ✓ Réduction de {sudsAvant - sudsApres} points — bon travail !
              </div>
            )}
            {sudsApres >= sudsAvant && sudsApres > 0 && (
              <div style={{ background: 'var(--chaud-pale)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.25rem', color: 'var(--chaud)', fontSize: '0.9rem' }}>
                Si l'intensité n'a pas baissé, c'est normal. L'EMDR demande parfois plusieurs sessions. Tu peux recommencer ou aller vers SOS si besoin.
              </div>
            )}

            <button onClick={sauvegarder}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#FF6B6B', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Sauvegarder la session
            </button>
          </div>
        )}
      </div>
      <SOSFlottant />
    </div>
  );
}
