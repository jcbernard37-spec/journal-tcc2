import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stockage } from '../lib/storage';

interface SessionTherapie {
  id: string;
  type: 'emdr' | 'yoga' | 'hypnose' | 'visualization' | 'bonus';
  nom: string;
  duree: number;
  date: string;
  efficacite: number; // 0-10
  avantApres?: { avant: number; apres: number };
}

export default function OutilsTherapeutiques() {
  const [sessions, setSessions] = useState<SessionTherapie[]>([]);
  const [filtreType, setFiltreType] = useState<string>('tous');
  const [filtreDuree, setFiltreDuree] = useState<string>('tous');
  const [affichageMode, setAffichageMode] = useState<'grille' | 'liste' | 'analytics'>('grille');

  useEffect(() => {
    const stored = localStorage.getItem('tcc_sessions_therapie');
    if (stored) setSessions(JSON.parse(stored));
  }, []);

  const outils = [
    {
      id: 'emdr',
      titre: 'EMDR Visuel',
      description: 'Traite traumas et peurs rapidement',
      duree: '5-15 min',
      couleur: '#FF6B6B',
      icon: '🎯',
      lien: '/emdr',
      efficacite: 87,
      utilisations: 12,
    },
    {
      id: 'yoga',
      titre: 'Yoga Nidra',
      description: 'Relaxation profonde et recharge',
      duree: '15-60 min',
      couleur: '#4ECDC4',
      icon: '🧘',
      lien: '/yoga-nidra',
      efficacite: 92,
      utilisations: 8,
    },
    {
      id: 'hypnose',
      titre: 'Hypnose Ericksonienne',
      description: 'Reprogramme tes croyances limitantes',
      duree: '20-40 min',
      couleur: '#9D84B7',
      icon: '🌀',
      lien: '/hypnose',
      efficacite: 89,
      utilisations: 5,
    },
    {
      id: 'visualization',
      titre: 'Visualisations Créatrices',
      description: 'Manifeste et transforme ta réalité',
      duree: '20-50 min',
      couleur: '#FFD93D',
      icon: '🌟',
      lien: '/visualisations',
      efficacite: 85,
      utilisations: 6,
    },
    {
      id: 'bonus',
      titre: 'Outils Bonus',
      description: 'Tapping, Breathing, Méditations, Affirmations',
      duree: '3-30 min',
      couleur: '#6BCF7F',
      icon: '🎁',
      lien: '/outils-bonus',
      efficacite: 78,
      utilisations: 15,
    },
  ];

  const sessionsRecentes = sessions.slice(-5).reverse();
  const efficaciteMoyenne = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.efficacite, 0) / sessions.length)
    : 0;

  return (
    <div className="page" style={{ background: '#FAFAF8' }}>
      <style>{`
        .zen-card {
          background: white;
          border-radius: 12px;
          padding: 1.6rem;
          border: 1px solid #E8E6E1;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .zen-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .zen-button {
          padding: 0.8rem 1.6rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.95rem;
        }

        .zen-button-primary {
          background: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
          color: white;
        }

        .zen-button-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 207, 127, 0.3);
        }

        .zen-button-secondary {
          background: #F0F0ED;
          color: #333;
          border: 1.5px solid #E0DDD8;
        }

        .zen-button-secondary:hover {
          background: #E8E6E1;
        }

        .zen-stat {
          text-align: center;
          padding: 1.2rem;
        }

        .zen-stat-number {
          font-size: 2.2rem;
          font-weight: 700;
          color: #6BCF7F;
          line-height: 1;
        }

        .zen-stat-label {
          font-size: 0.85rem;
          color: #999;
          margin-top: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .zen-float {
          animation: float 3s ease-in-out infinite;
        }

        .zen-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E8E6E1, transparent);
          margin: 1.6rem 0;
        }
      `}</style>

      <div className="conteneur-etroit" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.4rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.6rem', color: '#222' }}>
            Outils Thérapeutiques
          </h1>
          <p style={{ color: '#888', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Transforme tes patterns profonds avec EMDR, Hypnose, Yoga Nidra et Visualisations créatrices.
          </p>
        </div>

        {/* Stats rapides */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '2.4rem',
        }}>
          <div className="zen-card zen-stat">
            <div className="zen-stat-number">{sessions.length}</div>
            <div className="zen-stat-label">Sessions</div>
          </div>
          <div className="zen-card zen-stat">
            <div className="zen-stat-number">{efficaciteMoyenne}%</div>
            <div className="zen-stat-label">Efficacité</div>
          </div>
          <div className="zen-card zen-stat">
            <div className="zen-stat-number">{Math.round(sessions.reduce((acc, s) => acc + s.duree, 0))}h</div>
            <div className="zen-stat-label">Total</div>
          </div>
        </div>

        {/* Outils principaux */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.4rem',
          marginBottom: '2.4rem',
        }}>
          {outils.map(outil => (
            <div key={outil.id} className="zen-card zen-float" style={{
              borderTop: `4px solid ${outil.couleur}`,
            }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '0.8rem' }}>
                {outil.icon}
              </div>
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', color: '#222' }}>
                {outil.titre}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#666', lineHeight: 1.4 }}>
                {outil.description}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
                ⏱️ {outil.duree}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '0.2rem' }}>Efficacité</div>
                  <div style={{
                    height: '4px',
                    background: '#EEE',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: outil.couleur,
                      width: `${outil.efficacite}%`,
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999', minWidth: '35px' }}>
                  {outil.efficacite}%
                </div>
              </div>
              <Link to={outil.lien}>
                <button className="zen-button zen-button-primary" style={{ width: '100%' }}>
                  Commencer
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Sessions récentes */}
        {sessions.length > 0 && (
          <>
            <div className="zen-divider" />
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#222' }}>
                Sessions récentes
              </h2>
              <div style={{
                display: 'grid',
                gap: '0.8rem',
              }}>
                {sessionsRecentes.map((session, idx) => (
                  <div key={idx} className="zen-card" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.2rem',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#222', marginBottom: '0.2rem' }}>
                        {session.nom}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        {new Date(session.date).toLocaleDateString()} • {session.duree} min
                      </div>
                    </div>
                    <div style={{
                      background: '#E8F5E9',
                      color: '#2E7D32',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}>
                      {session.efficacite}/10
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="zen-divider" />
        <div style={{ textAlign: 'center', padding: '1.6rem' }}>
          <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Combinez les outils pour des résultats maximaux. L'IA te recommande le meilleur combo pour toi.
          </p>
          <Link to="/hub">
            <button className="zen-button zen-button-secondary">
              ← Retour au tableau de bord
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
