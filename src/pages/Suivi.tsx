import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEUILLES } from '../data/tcc';
import { stockage, formaterDate } from '../lib/storage';

export default function Suivi() {
  const navigate = useNavigate();
  const entrees = stockage.getEntrees();
  const [filtre, setFiltre] = useState<string | null>(null);
  const [entreeSelectionnee, setEntreeSelectionnee] = useState<typeof entrees[0] | null>(null);

  // Groupe les entrées par feuille
  const entreesParFeuille: Record<string, typeof entrees> = {};
  entrees.forEach(e => {
    if (!entreesParFeuille[e.feuille]) {
      entreesParFeuille[e.feuille] = [];
    }
    entreesParFeuille[e.feuille].push(e);
  });

  // Trie par date décroissante
  Object.keys(entreesParFeuille).forEach(feuille => {
    entreesParFeuille[feuille].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const feuilleFiltree = filtre ? entreesParFeuille[filtre] || [] : [];
  const afficherTout = !filtre;

  return (
    <div className="page">
      <div className="conteneur apparition" style={{ paddingTop: '2rem' }}>
        <h1>📖 Mon historique</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem', marginBottom: '1.4rem' }}>
          Rellis ce que tu as rempli, ou continue à travailler dessus.
        </p>

        {entrees.length === 0 ? (
          <div className="carte" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--encre-3)' }}>Aucune entrée pour l'instant.</p>
            <button className="btn btn-primaire" onClick={() => navigate('/feuilles')} style={{ marginTop: '1rem' }}>
              Commencer une feuille →
            </button>
          </div>
        ) : (
          <>
            {/* Filtres par feuille */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
              <button
                className={`btn ${!filtre ? 'btn-primaire' : 'btn-doux'}`}
                onClick={() => setFiltre(null)}
              >
                Toutes ({entrees.length})
              </button>
              {Object.keys(entreesParFeuille).map(feuilleId => {
                const feuille = FEUILLES.find(f => f.slug === feuilleId);
                const count = entreesParFeuille[feuilleId].length;
                return (
                  <button
                    key={feuilleId}
                    className={`btn ${filtre === feuilleId ? 'btn-primaire' : 'btn-doux'}`}
                    onClick={() => setFiltre(feuilleId)}
                  >
                    {feuille?.titre || feuilleId} ({count})
                  </button>
                );
              })}
            </div>

            {/* Affichage des entrées */}
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {afficherTout ? (
                // Affiche toutes les feuilles
                Object.keys(entreesParFeuille).map(feuilleId => {
                  const feuille = FEUILLES.find(f => f.slug === feuilleId);
                  return (
                    <div key={feuilleId}>
                      <h3 style={{ margin: '1.2rem 0 0.6rem', color: 'var(--sauge-fonce)', fontSize: '1rem' }}>
                        {feuille?.titre}
                      </h3>
                      <div style={{ display: 'grid', gap: '0.6rem' }}>
                        {entreesParFeuille[feuilleId].map((entree, idx) => (
                          <button
                            key={idx}
                            className="carte carte-clic"
                            onClick={() => setEntreeSelectionnee(entree)}
                            style={{ textAlign: 'left', padding: '0.9rem' }}
                          >
                            <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)' }}>
                              {formaterDate(entree.date)}
                            </div>
                            <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: 'var(--encre)' }}>
                              {Object.values(entree.valeurs)
                                .filter(v => typeof v === 'string' && v.trim())
                                .slice(0, 1)
                                .map(v => (v as string).substring(0, 50))
                                .join('...')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Affiche la feuille filtrée
                <div>
                  {feuilleFiltree.map((entree, idx) => (
                    <button
                      key={idx}
                      className="carte carte-clic"
                      onClick={() => setEntreeSelectionnee(entree)}
                      style={{ textAlign: 'left', padding: '1rem', marginBottom: '0.8rem', width: '100%' }}
                    >
                      <div style={{ fontSize: '0.9rem', color: 'var(--encre-3)', marginBottom: '0.4rem' }}>
                        {formaterDate(entree.date)}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--encre)' }}>
                        {Object.values(entree.valeurs)
                          .filter(v => typeof v === 'string' && v.trim())
                          .slice(0, 2)
                          .map(v => (v as string).substring(0, 60))
                          .join(' • ')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de détail */}
        {entreeSelectionnee && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem',
          }} onClick={() => setEntreeSelectionnee(null)}>
            <div className="carte" style={{ maxWidth: 600, maxHeight: '85vh', overflow: 'auto', padding: '1.5rem' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                  {FEUILLES.find(f => f.slug === entreeSelectionnee.feuille)?.titre}
                </h3>
                <button className="btn btn-doux btn-sm" onClick={() => setEntreeSelectionnee(null)}>✕</button>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--encre-3)', marginBottom: '1.2rem' }}>
                {formaterDate(entreeSelectionnee.date)}
              </div>

              {/* Affiche tous les champs */}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(entreeSelectionnee.valeurs).map(([cle, valeur]) => {
                  if (!valeur || (typeof valeur === 'string' && !valeur.trim()) || (Array.isArray(valeur) && valeur.length === 0)) {
                    return null;
                  }
                  return (
                    <div key={cle} style={{ borderLeft: '3px solid var(--sauge)', paddingLeft: '0.8rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sauge-fonce)', marginBottom: '0.3rem', textTransform: 'capitalize' }}>
                        {cle.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--encre)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {Array.isArray(valeur) ? valeur.join(', ') : String(valeur)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Boutons d'action */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-doux" onClick={() => setEntreeSelectionnee(null)}>
                  Fermer
                </button>
                <button className="btn btn-primaire" onClick={() => {
                  navigate(`/feuille/${entreeSelectionnee.feuille}`);
                  setEntreeSelectionnee(null);
                }}>
                  Éditer cette entrée →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
