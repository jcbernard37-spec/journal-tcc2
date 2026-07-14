import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Duree = 'court' | 'moyen' | 'long';

export default function YogaNidra() {
  const navigate = useNavigate();
  const [duree, setDuree] = useState<Duree | null>(null);
  const [phase, setPhase] = useState<'choix' | 'avant' | 'session' | 'apres'>('choix');
  const [avantScore, setAvantScore] = useState(5);
  const [apresScore, setApresScore] = useState(5);
  const [intentions, setIntentions] = useState('');

  const durees = {
    court: { min: 15, titre: 'Court 15 min', desc: 'Rapide et efficace' },
    moyen: { min: 30, titre: 'Moyen 30 min', desc: 'Complet et profond' },
    long: { min: 60, titre: 'Long 60 min', desc: 'Therapeutique intensif' },
  };

  const handleSauvegarder = () => {
    const session = {
      id: Date.now().toString(),
      type: 'yoga',
      nom: `Yoga Nidra ${durees[duree!].titre}`,
      duree: durees[duree!].min,
      date: new Date().toISOString(),
      efficacite: Math.max(0, (apresScore - avantScore) * 15),
      intentions,
    };

    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);
    sessions.push(session);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(sessions));
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={() => navigate('/outils-therapeutiques')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
          Retour
        </button>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.4rem', border: '1px solid #E8E6E1' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Yoga Nidra</h1>
          <p style={{ color: '#888', margin: 0 }}>Relaxation profonde. État entre veille et sommeil. Recharge totale.</p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis ta session</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
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

            <textarea
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder="Ta Sankalpa (intention) : Qu'est-ce que tu veux renforcer en toi ?"
              style={{
                width: '100%',
                padding: '1rem',
                border: '1.5px solid #E8E6E1',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical',
                marginBottom: '1.4rem',
              }}
            />

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => setPhase('choix')} style={{ flex: 1, padding: '1rem', background: '#F0F0ED', border: '1.5px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Retour
              </button>
              <button
                onClick={() => setPhase('session')}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#4ECDC4',
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
          </div>
        )}

        {phase === 'session' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>Session en cours...</h2>
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
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              Relaxe-toi. Laisse-toi porter par la guidage.
            </p>
            <button
              onClick={() => setPhase('apres')}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#F0F0ED',
                border: '1.5px solid #E0DDD8',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Terminer
            </button>
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
              <div style={{ background: '#E8F5E9', padding: '1rem', borderRadius: '8px', marginBottom: '1.4rem', color: '#2E7D32', fontWeight: 600 }}>
                Amelioration : +{apresScore - avantScore}
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
    </div>
  );
}
