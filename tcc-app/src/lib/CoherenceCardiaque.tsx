import { useState, useRef, useEffect } from 'react';

interface CoherenceProps {
  dureeSecondes?: number; // Durée totale de la séance (défaut 5 min)
}

export function CoherenceCardiaque({ dureeSecondes = 300 }: CoherenceProps) {
  const [lancee, setLancee] = useState(false);
  const [tempsRestant, setTempsRestant] = useState(dureeSecondes);
  const [phase, setPhase] = useState<'inspiration' | 'retention' | 'expiration'>('inspiration');
  const [cycles, setCycles] = useState(0);
  const [tailleCercle, setTailleCercle] = useState(80);
  const timerRef = useRef<number | null>(null);
  const phaseDurationRef = useRef({ inspiration: 4, retention: 4, expiration: 4 });
  const phaseCounterRef = useRef(0);

  // Rythme de cohérence cardiaque : 6 cycles par minute (4-4-4 secondes)
  const INSPIRATION = 4;
  const RETENTION = 4;
  const EXPIRATION = 4;
  const CYCLE_DURATION = INSPIRATION + RETENTION + EXPIRATION;

  useEffect(() => {
    if (!lancee || tempsRestant <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (tempsRestant <= 0) {
        setLancee(false);
        setPhase('inspiration');
        setTempsRestant(dureeSecondes);
        setCycles(0);
        phaseCounterRef.current = 0;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      phaseCounterRef.current += 1;

      // Détermine la phase actuelle
      let currentPhase: 'inspiration' | 'retention' | 'expiration' = 'inspiration';
      let phaseIndex = (phaseCounterRef.current - 1) % CYCLE_DURATION;
      
      if (phaseIndex < INSPIRATION) currentPhase = 'inspiration';
      else if (phaseIndex < INSPIRATION + RETENTION) currentPhase = 'retention';
      else currentPhase = 'expiration';

      setPhase(currentPhase);

      // Taille du cercle selon la phase
      const progress = (phaseIndex % CYCLE_DURATION) / CYCLE_DURATION;
      if (currentPhase === 'inspiration') {
        setTailleCercle(80 + 30 * (phaseIndex / INSPIRATION));
      } else if (currentPhase === 'retention') {
        setTailleCercle(110);
      } else {
        setTailleCercle(110 - 30 * ((phaseIndex - INSPIRATION - RETENTION) / EXPIRATION));
      }

      // Compte les cycles complétés
      if (phaseCounterRef.current % CYCLE_DURATION === 0) {
        setCycles(c => c + 1);
      }

      // Décrémente le temps restant
      setTempsRestant(t => {
        const remaining = t - 1;
        if (remaining <= 0) {
          setLancee(false);
        }
        return remaining;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lancee, tempsRestant, dureeSecondes]);

  const toggleSeance = () => {
    if (lancee) {
      setLancee(false);
    } else {
      setLancee(true);
      setTempsRestant(dureeSecondes);
      setCycles(0);
      phaseCounterRef.current = 0;
      setPhase('inspiration');
      setTailleCercle(80);
    }
  };

  const reinitialiser = () => {
    setLancee(false);
    setTempsRestant(dureeSecondes);
    setCycles(0);
    phaseCounterRef.current = 0;
    setPhase('inspiration');
    setTailleCercle(80);
  };

  const formatTemps = (secondes: number) => {
    const mins = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const textePhase = {
    inspiration: '🫁 INSPIRE lentement par le nez',
    retention: '⏸️ Rétiens ton souffle',
    expiration: '💨 EXPIRE lentement par la bouche',
  };

  const couleurPhase = {
    inspiration: '#4A7A6F',
    retention: '#C9835A',
    expiration: '#B5544D',
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>🫁 Cohérence cardiaque</h2>
      <p style={{ color: 'var(--encre-2)', marginBottom: '2rem' }}>
        Une respiration guidée pour apaiser ton système nerveux. 6 cycles par minute.
      </p>

      {/* Cercle animé */}
      <div
        style={{
          width: `${tailleCercle}px`,
          height: `${tailleCercle}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${couleurPhase[phase]}, rgba(74,122,111,0.6))`,
          margin: '0 auto 2rem',
          transition: 'all 0.1s linear',
          boxShadow: `0 0 0 ${20 - (tailleCercle - 80) / 3}px rgba(74,122,111,0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        {lancee ? (phase === 'inspiration' ? '↑' : phase === 'retention' ? '❋' : '↓') : '○'}
      </div>

      {/* Texte de la phase */}
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: couleurPhase[phase], marginBottom: '1.5rem', minHeight: 28 }}>
        {lancee ? textePhase[phase] : 'Prêt à commencer ?'}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div className="carte" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)', marginBottom: '0.3rem' }}>Temps</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--bleu-nuit)' }}>
            {formatTemps(tempsRestant)}
          </div>
        </div>
        <div className="carte" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)', marginBottom: '0.3rem' }}>Cycles</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--sauge)' }}>
            {cycles}
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div style={{
        height: '8px',
        background: '#EEE',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'var(--sauge)',
          width: `${((dureeSecondes - tempsRestant) / dureeSecondes) * 100}%`,
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className={lancee ? 'btn btn-crise' : 'btn btn-primaire'}
          onClick={toggleSeance}
          style={{ minWidth: 120 }}
        >
          {lancee ? '⏸️ Pause' : '▶️ Lancer'}
        </button>
        <button
          className="btn btn-doux"
          onClick={reinitialiser}
          style={{ minWidth: 120 }}
        >
          🔄 Réinitialiser
        </button>
      </div>

      <div className="encart encart-info" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <strong>Conseil :</strong> Fais au moins 5 minutes (30 cycles) pour sentir les effets.
        Respire naturellement, sans forcer. L'app guide le rythme.
      </div>
    </div>
  );
}
