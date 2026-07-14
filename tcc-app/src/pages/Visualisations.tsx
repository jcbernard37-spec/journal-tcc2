import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VisuType = 'abondance' | 'guerison' | 'enfant' | 'ressources' | 'safe' | 'dialogue';

export default function Visualisations() {
  const navigate = useNavigate();
  const [type, setType] = useState<VisuType | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [ressentieScore, setRessentieScore] = useState(5);
  const [transformation, setTransformation] = useState('');

  const visualisations: Record<VisuType, { titre: string; desc: string; duree: string; icon: string }> = {
    abondance: { titre: 'Abondance et Manifestation', desc: 'Attire ce que tu veux', duree: '30 min', icon: '🌟' },
    guerison: { titre: 'Guerison Emotionnelle', desc: 'Pardonne et libere-toi', duree: '40 min', icon: '💔' },
    enfant: { titre: 'Enfant Interieur', desc: 'Rencontre ta version enfant', duree: '45 min', icon: '👶' },
    ressources: { titre: 'Ressources Futures', desc: 'Visualise ton succes', duree: '25 min', icon: '🚀' },
    safe: { titre: 'Safe Place', desc: 'Cree ton lieu de securite', duree: '20 min', icon: '🏝️' },
    dialogue: { titre: 'Dialogue Transformateur', desc: 'Parle a tes emotions', duree: '50 min', icon: '🗣️' },
  };

  const handleSauvegarder = () => {
    const session = {
      id: Date.now().toString(),
      type: 'visualization',
      nom: visualisations[type!].titre,
      duree: parseInt(visualisations[type!].duree),
      date: new Date().toISOString(),
      efficacite: ressentieScore * 15,
      transformation,
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
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Visualisations Cratrices</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Manifeste ta realite. Transforme tes emotions. Visualise ta vie ideale.
          </p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis une visualization</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
              {Object.entries(visualisations).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setType(key as VisuType)}
                  style={{
                    padding: '1.4rem',
                    border: type === key ? '2px solid #FFD93D' : '2px solid #E8E6E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: type === key ? 'rgba(255, 217, 61, 0.1)' : 'white',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>
                    {val.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#222' }}>
                    {val.titre}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                    {val.duree}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    {val.desc}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => type && setPhase('session')}
              disabled={!type}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#FFD93D',
                color: '#222',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Commencer
            </button>
          </div>
        )}

        {phase === 'session' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              {visualisations[type!].titre}
            </h2>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD93D, #FFC93D)',
                margin: '2rem auto',
                animation: 'glow 3s ease-in-out infinite',
              }}
            />
            <p style={{ color: '#666', marginBottom: '1.4rem' }}>
              Ferme tes yeux. Visualise en detail. Utilise tous tes sens. Ressens les emotions.
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
              Visualization Terminee
            </button>
          </div>
        )}

        {phase === 'apres' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Apres la visualization</h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Qu'est-ce que tu as ressenti ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={ressentieScore} onChange={(e) => setRessentieScore(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFD93D', marginTop: '0.4rem' }}>
                {ressentieScore}/10
              </div>
            </div>

            <textarea
              value={transformation}
              onChange={(e) => setTransformation(e.target.value)}
              placeholder="Qu'est-ce qui a change ? Qu'as-tu appris ?"
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

            <button
              onClick={handleSauvegarder}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#FFD93D',
                color: '#222',
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

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 217, 61, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 217, 61, 0.6); }
        }
      `}</style>
    </div>
  );
}
