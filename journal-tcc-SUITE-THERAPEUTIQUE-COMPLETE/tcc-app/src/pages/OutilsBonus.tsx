import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OutilsBonus() {
  const navigate = useNavigate();
  const [toolActive, setToolActive] = useState<string | null>(null);
  const [avant, setAvant] = useState(5);
  const [apres, setApres] = useState(5);

  const outils = [
    { id: 'tapping', titre: 'Tapping/EFT', desc: '5 min - Points acupressure', icon: '🎯' },
    { id: 'breathing', titre: 'Box Breathing', desc: '3-10 min - Respiration carree', icon: '📦' },
    { id: 'meditation', titre: 'Meditations Guidees', desc: '5-30 min - Body Scan, Gratitude', icon: '🧘' },
    { id: 'affirmations', titre: 'Affirmations Positives', desc: '5-10 min - Audio et Repetition', icon: '💪' },
  ];

  const handleSave = (toolId: string) => {
    const session = {
      id: Date.now().toString(),
      type: 'bonus',
      nom: outils.find(o => o.id === toolId)?.titre || toolId,
      duree: 10,
      date: new Date().toISOString(),
      efficacite: Math.max(0, (apres - avant) * 15),
      avantApres: { avant, apres },
    };

    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);
    sessions.push(session);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(sessions));
    alert('Session sauvegardee !');
    setToolActive(null);
  };

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem' }}>
        <button onClick={() => navigate('/outils-therapeutiques')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.2rem' }}>
          Retour
        </button>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.4rem', border: '1px solid #E8E6E1' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Outils Bonus</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Outils rapides et efficaces pour l'immediat. EFT, Breathing, Meditations, Affirmations.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.4rem', color: '#222' }}>Choisis un outil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {outils.map(outil => (
              <div
                key={outil.id}
                onClick={() => setToolActive(outil.id)}
                style={{
                  padding: '1.2rem',
                  border: toolActive === outil.id ? '2px solid #6BCF7F' : '2px solid #E8E6E1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: toolActive === outil.id ? '#6BCF7F' : 'white',
                  color: toolActive === outil.id ? 'white' : '#222',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>
                  {outil.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                  {outil.titre}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {outil.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {toolActive && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.8rem', border: '1px solid #E8E6E1', marginTop: '1.4rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#222' }}>
              {outils.find(o => o.id === toolActive)?.titre}
            </h2>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Avant : Comment tu te sens ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={avant} onChange={(e) => setAvant(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FF6B6B', marginTop: '0.4rem' }}>
                {avant}/10
              </div>
            </div>

            <div style={{ background: '#F5F5F5', padding: '1rem', borderRadius: '8px', marginBottom: '1.4rem', fontSize: '0.9rem', color: '#666' }}>
              Lance l'outil continuer pendant 5-10 minutes puis evalues comment tu te sens maintenant
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#222' }}>
                Apres : Comment tu te sens maintenant ? (0-10)
              </label>
              <input type="range" min="0" max="10" value={apres} onChange={(e) => setApres(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6BCF7F', marginTop: '0.4rem' }}>
                {apres}/10
              </div>
            </div>

            {apres > avant && (
              <div style={{ background: '#E8F5E9', padding: '1rem', borderRadius: '8px', marginBottom: '1.4rem', color: '#2E7D32', fontWeight: 600 }}>
                Amelioration : +{apres - avant}
              </div>
            )}

            <button
              onClick={() => handleSave(toolActive)}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: '#6BCF7F',
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
