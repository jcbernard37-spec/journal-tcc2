import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Niveau = 'relaxation' | 'croyance' | 'ressource';

export default function Hypnose() {
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [phase, setPhase] = useState<'choix' | 'setup' | 'session' | 'apres'>('choix');
  const [croyance, setCreyance] = useState('');
  const [apresScore, setApresScore] = useState(5);
  const [objectives, setObjectives] = useState('');

  const niveaux = {
    relaxation: { titre: 'Hypnose Relaxation', duree: '20 min', desc: 'Calme et securite' },
    croyance: { titre: 'Changement de Croyance', duree: '40 min', desc: 'Reprogramme tes patterns' },
    ressource: { titre: 'Ancrage de Ressource', duree: '30 min', desc: 'Amplifier ta puissance' },
  };

  const handleSauvegarder = () => {
    const session = {
      id: Date.now().toString(),
      type: 'hypnose',
      nom: niveaux[niveau!].titre,
      duree: parseInt(niveaux[niveau!].duree),
      date: new Date().toISOString(),
      efficacite: apresScore * 15,
      croyance,
      objectif: objectives,
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
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Hypnose Ericksonienne</h1>
          <p style={{ color: '#888', margin: 0 }}>Reprogramme tes croyances limitantes via suggestions et metaphores puissantes.</p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis ton niveau</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
              {Object.entries(niveaux).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setNiveau(key as Niveau)}
                  style={{
                    padding: '1.2rem',
                    border: niveau === key ? '2px solid #9D84B7' : '2px solid #E8E6E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: niveau === key ? '#9D84B7' : 'white',
                    color: niveau === key ? 'white' : '#222',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
                    {val.titre}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.4rem' }}>
                    {val.duree}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {val.desc}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => niveau && setPhase('setup')}
              disabled={!niveau}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#9D84B7',
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

        {phase === 'setup' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Preparation</h2>

            {niveau === 'croyance' && (
              <textarea
                value={croyance}
                onChange={(e) => setCreyance(e.target.value)}
                placeholder="Quelle croyance limitante veux-tu changer ?"
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
            )}

            <textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Qu'est-ce que tu veux realiser apres cette hypnose ?"
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
                  background: '#9D84B7',
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
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              Induction hypnotique...
            </h2>
            <div
              style={{
                width: '100px',
                height: '100px',
                margin: '2rem auto',
                border: '3px solid #9D84B7',
                borderRadius: '50%',
                animation: 'spin 4s linear infinite',
              }}
            />
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              Ferme tes yeux. Laisse-toi guider. Ton subconscient ecoute chaque mot...
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
              Session Terminee
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
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#9D84B7', marginTop: '0.4rem' }}>
                {apresScore}/10
              </div>
            </div>

            <button
              onClick={handleSauvegarder}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#9D84B7',
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
