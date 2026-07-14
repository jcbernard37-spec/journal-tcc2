import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';

const SCRIPT_INTRO = [
  { texte: "Bienvenue dans cette session EMDR. Je vais te guider à travers le traitement.", pause: 3000 },
  { texte: "L'EMDR utilise des stimulations visuelles alternées pour aider ton cerveau à traiter les souvenirs douloureux.", pause: 4000 },
  { texte: "Pense à quelque chose qui te cause du stress. Une peur, un souvenir difficile, une tension.", pause: 5000 },
  { texte: "Donne-lui un score de zéro à dix. Zéro, pas de détresse. Dix, détresse maximale.", pause: 5000 },
  { texte: "Garde cette image ou cette pensée présente à l'esprit. Maintenant, suis les cercles des yeux, de gauche à droite.", pause: 4000 },
  { texte: "Laisse venir ce qui vient. Des pensées, des images, des sensations. Ne les retiens pas. Laisse-les passer.", pause: 4000 },
  { texte: "La stimulation commence.", pause: 2000 },
];

const SCRIPTS_PAUSE = [
  [
    { texte: "Pause. Prends une grande inspiration.", pause: 4000 },
    { texte: "Qu'est-ce que tu remarques ? Des pensées, des images, des sensations dans le corps ?", pause: 6000 },
    { texte: "Note-le simplement. Puis nous continuons.", pause: 4000 },
  ],
  [
    { texte: "Autre pause. Respire.", pause: 4000 },
    { texte: "Qu'est-ce qui vient maintenant ? Comment a changé ce que tu ressentais au début ?", pause: 6000 },
    { texte: "Continue à suivre les yeux.", pause: 3000 },
  ],
  [
    { texte: "Respire. Tu fais du très bon travail.", pause: 4000 },
    { texte: "Notice ce qui se passe dans ton corps en ce moment. Y a-t-il une différence ?", pause: 6000 },
    { texte: "Continuons.", pause: 2000 },
  ],
];

const SCRIPT_FIN = [
  { texte: "Bien. Nous allons maintenant installer la ressource.", pause: 3000 },
  { texte: "Pense à quelque chose de positif. Un souvenir agréable, une force que tu possèdes.", pause: 5000 },
  { texte: "Suis les yeux en gardant cette image positive.", pause: 3000 },
];

export default function EMDR() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'info' | 'suds' | 'traitement' | 'ressource' | 'apres'>('info');
  const [sudsAvant, setSudsAvant] = useState(6);
  const [sudsApres, setSudsApres] = useState(6);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [tempsTotal, setTempsTotal] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [pauseRound, setPauseRound] = useState(0);
  const [actif, setActif] = useState(false);

  const dirRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    arreter();
    if (dirRef.current) clearInterval(dirRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pauseRef.current) clearTimeout(pauseRef.current);
  }, []);

  const demarrerTraitement = () => {
    setActif(true);
    setPhase('traitement');
    setTempsTotal(0);
    setCycles(0);
    setPauseRound(0);

    timerRef.current = setInterval(() => setTempsTotal(t => t + 1), 1000);

    jouerScriptGuidé(SCRIPT_INTRO, undefined, () => {
      demarrerStimulation();
    });
  };

  const demarrerStimulation = () => {
    // Alterner gauche/droite 1 fois par seconde
    dirRef.current = setInterval(() => {
      setDirection(d => d === 'left' ? 'right' : 'left');
      setCycles(c => c + 1);
    }, 900);

    // Pause toutes les 30 secondes
    schedulePause();
  };

  const schedulePause = () => {
    const round = pauseRound;
    pauseRef.current = setTimeout(() => {
      // Arrêter la stimulation visuelle
      if (dirRef.current) clearInterval(dirRef.current);

      // Lire le script de pause
      const scriptPause = SCRIPTS_PAUSE[Math.min(round, SCRIPTS_PAUSE.length - 1)];
      jouerScriptGuidé(scriptPause, undefined, () => {
        setPauseRound(r => r + 1);
        // Reprendre si on n'a pas encore fait 3 rounds
        if (round < 2) {
          dirRef.current = setInterval(() => {
            setDirection(d => d === 'left' ? 'right' : 'left');
            setCycles(c => c + 1);
          }, 900);
          schedulePause();
        } else {
          // Passer à la ressource
          if (dirRef.current) clearInterval(dirRef.current);
          jouerScriptGuidé(SCRIPT_FIN, undefined, () => {
            demarrerStimulationRessource();
          });
        }
      });
    }, 30000);
  };

  const demarrerStimulationRessource = () => {
    setPhase('ressource');
    dirRef.current = setInterval(() => {
      setDirection(d => d === 'left' ? 'right' : 'left');
    }, 900);
    setTimeout(() => {
      if (dirRef.current) clearInterval(dirRef.current);
      setActif(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('apres');
    }, 20000);
  };

  const arreterManuellement = () => {
    arreter();
    if (dirRef.current) clearInterval(dirRef.current);
    if (pauseRef.current) clearTimeout(pauseRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setActif(false);
    setPhase('apres');
  };

  const sauvegarder = () => {
    const s = { id: Date.now().toString(), type: 'emdr', nom: 'Session EMDR', duree: Math.round(tempsTotal / 60), date: new Date().toISOString(), suds: { avant: sudsAvant, apres: sudsApres }, efficacite: Math.max(0, (sudsAvant - sudsApres) * 12 + 40) };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    navigate('/outils-therapeutiques');
  };

  const formatTemps = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
          <h1 style={{ marginBottom: '0.5rem' }}>EMDR Guidé</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>Stimulation bilatérale guidée par la voix. Suis les cercles des yeux et laisse le traitement se faire.</p>
        </div>

        {phase === 'info' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Comment ça fonctionne</h2>
            <div style={{ color: 'var(--encre-2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '0.75rem' }}>L'EMDR (Eye Movement Desensitization and Reprocessing) est une thérapie validée scientifiquement pour traiter les traumatismes et les peurs.</p>
              <p style={{ marginBottom: '0.75rem' }}>Tu vas suivre des cercles alternés gauche-droite pendant que tu penses à quelque chose qui te cause du stress. La voix te guide tout au long.</p>
              <p>3 séries de 30 secondes + installation d'une ressource positive.</p>
            </div>
            <button onClick={() => setPhase('suds')}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#FF6B6B', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Commencer →
            </button>
          </div>
        )}

        {phase === 'suds' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Avant le traitement</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1rem' }}>Pense à ce que tu veux traiter. Quel est ton niveau de détresse maintenant ?</p>
            <input type="range" min={0} max={10} value={sudsAvant} onChange={e => setSudsAvant(+e.target.value)} style={{ width: '100%', accentColor: '#FF6B6B', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Aucune détresse</span>
              <span style={{ fontWeight: 700, color: '#FF6B6B', fontSize: '1.2rem' }}>{sudsAvant}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Maximum</span>
            </div>
            <div style={{ background: 'rgba(255,107,107,0.1)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#CC4444', fontSize: '0.88rem' }}>
              🎙️ La voix te guidera tout au long. Mets le volume de ton appareil.
            </div>
            <button onClick={demarrerTraitement}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#FF6B6B', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              🎙️ Démarrer le traitement guidé
            </button>
          </div>
        )}

        {(phase === 'traitement' || phase === 'ressource') && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>
              {phase === 'ressource' ? 'Installation de la ressource' : 'Traitement EMDR'}
            </h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              {phase === 'ressource' ? 'Pense à quelque chose de positif' : 'Suis les cercles des yeux'}
            </p>

            {/* Animation bilatérale */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', margin: '2rem auto', height: '100px' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: direction === 'left' ? '#FF6B6B' : 'var(--bg-2)',
                transition: 'background 0.2s, transform 0.2s',
                transform: direction === 'left' ? 'scale(1.1)' : 'scale(0.85)',
              }} />
              <div style={{ color: 'var(--encre-3)', fontSize: '1.5rem' }}>↔</div>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: direction === 'right' ? '#FF6B6B' : 'var(--bg-2)',
                transition: 'background 0.2s, transform 0.2s',
                transform: direction === 'right' ? 'scale(1.1)' : 'scale(0.85)',
              }} />
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF6B6B', marginBottom: '0.5rem' }}>{formatTemps(tempsTotal)}</div>
            <div style={{ color: 'var(--encre-3)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              {cycles} cycles · Série {Math.min(pauseRound + 1, 3)}/3
            </div>

            <button onClick={arreterManuellement}
              style={{ padding: '0.85rem 2rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: 'pointer', color: 'var(--chaud)' }}>
              Arrêter
            </button>
          </div>
        )}

        {phase === 'apres' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ marginBottom: '1.25rem' }}>Après le traitement 🎯</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1rem' }}>Comment est ton niveau de détresse maintenant ?</p>
            <input type="range" min={0} max={10} value={sudsApres} onChange={e => setSudsApres(+e.target.value)} style={{ width: '100%', accentColor: '#FF6B6B', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Aucune détresse</span>
              <span style={{ fontWeight: 700, color: '#FF6B6B', fontSize: '1.2rem' }}>{sudsApres}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Maximum</span>
            </div>
            {sudsApres < sudsAvant && (
              <div style={{ background: 'var(--accent-pale)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: 'var(--accent-fonce)', fontWeight: 600 }}>
                ✓ Réduction de {sudsAvant - sudsApres} points — excellent !
              </div>
            )}
            <button onClick={sauvegarder}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#FF6B6B', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Sauvegarder la session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
