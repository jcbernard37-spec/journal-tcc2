import { useNavigate } from 'react-router-dom';
import { FEUILLES, SCHEMAS, FAMILLES_SCHEMAS } from '../data/tcc';
import { stockage } from '../lib/storage';
import { genererParcours } from '../lib/parcours';
import { useState, useEffect } from 'react';

export default function Hub() {
  const navigate = useNavigate();
  const profil = stockage.getProfil();
  const entrees = stockage.getEntrees();
  const cetteSemaine = entrees.filter(e => Date.now() - new Date(e.date).getTime() < 7 * 86400000).length;
  const [modifierSchemas, setModifierSchemas] = useState(false);

  if (!profil) {
    navigate('/onboarding');
    return null;
  }

  const heure = new Date().getHours();
  const salut = heure < 6 ? 'Bonsoir' : heure < 18 ? 'Bonjour' : 'Bonsoir';
  
  const parcours = genererParcours(profil.schemas || []);
  const feuillesRecommandees = parcours.slice(0, 3);

  return (
    <div className="page">
      <div className="conteneur apparition" style={{ paddingTop: '2.2rem' }}>
        <h1>{salut}, {profil.prenom} 🌿</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem' }}>
          Ton espace de travail. Tout est accessible librement — aucun parcours imposé.
        </p>

        <div className="grille-3" style={{ marginTop: '1.8rem' }}>
          <div className="carte" style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: '2.2rem', color: 'var(--sauge)' }}>{entrees.length}</div>
            <div style={{ color: 'var(--encre-2)', fontWeight: 700, fontSize: '0.9rem' }}>entrées au total</div>
          </div>
          <div className="carte" style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: '2.2rem', color: 'var(--ambre)' }}>{cetteSemaine}</div>
            <div style={{ color: 'var(--encre-2)', fontWeight: 700, fontSize: '0.9rem' }}>cette semaine</div>
          </div>
          <div className="carte" style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: '2.2rem', color: 'var(--bleu-nuit)' }}>
              {profil.gad7.reduce((a, b) => a + Math.max(b, 0), 0)}<span style={{ fontSize: '1rem', color: 'var(--encre-3)' }}>/21</span>
            </div>
            <div style={{ color: 'var(--encre-2)', fontWeight: 700, fontSize: '0.9rem' }}>GAD-7 de départ</div>
          </div>
        </div>

        {profil.schemas && profil.schemas.length > 0 && (
          <div className="carte" style={{ marginTop: '1.4rem', background: 'var(--lin-pale)', borderLeft: '4px solid var(--sauge)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>🌿 Ton parcours recommandé</h3>
                <p style={{ color: 'var(--encre-2)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Selon tes schémas identifiés, voici par quoi commencer :
                </p>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {feuillesRecommandees.map((rec, i) => {
                    const feuille = FEUILLES.find(f => f.slug === rec.slug);
                    return feuille ? (
                      <button key={rec.slug} type="button" className="carte carte-clic"
                        style={{ textAlign: 'left', padding: '0.7rem 0.9rem' }}
                        onClick={() => navigate(`/feuille/${rec.slug}`)}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{i + 1}. {feuille.titre}</div>
                        <div style={{ color: 'var(--encre-3)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                          {rec.raisons.slice(0, 2).join(' • ')}
                        </div>
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
            <button className="btn btn-doux btn-sm" onClick={() => setModifierSchemas(true)}
              style={{ marginTop: '1rem' }}>
              ✏️ Modifier mes schémas
            </button>
          </div>
        )}

        <h2 style={{ marginTop: '2.8rem' }}>Par où commencer aujourd'hui ?</h2>
        <div className="grille-2" style={{ marginTop: '1.2rem' }}>
          <div className="carte fiche carte-clic" style={{ ['--fiche-couleur' as string]: '#C9835A' }}
            onClick={() => navigate('/assistant')}>
            <span className="etiquette etiquette-ambre">Nouveau · Guide</span>
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>💬 Parler à l'assistant</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              Tu ne sais pas par où commencer ? Dis-lui ce que tu ressens, il t'oriente vers le bon outil.
            </p>
          </div>
          <div className="carte fiche carte-clic" style={{ ['--fiche-couleur' as string]: '#4A7A6F' }}
            onClick={() => navigate('/feuille/bec')}>
            <span className="etiquette etiquette-sauge">Le classique</span>
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>📋 Journal de pensées (BEC)</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              Une émotion forte aujourd'hui ? C'est ici qu'on la décortique.
            </p>
          </div>
        </div>

        <h2 style={{ marginTop: '2.8rem' }}>Les 10 feuilles</h2>
        <div className="grille-3" style={{ marginTop: '1.2rem' }}>
          {FEUILLES.map(f => (
            <div key={f.slug} className="carte fiche carte-clic"
              style={{ ['--fiche-couleur' as string]: f.couleur, padding: '1.3rem' }}
              onClick={() => navigate(`/feuille/${f.slug}`)}>
              <div style={{ fontSize: '1.6rem' }}>{f.icone}</div>
              <h3 style={{ margin: '0.5rem 0 0.3rem', fontSize: '1.02rem' }}>{f.titre}</h3>
              <p style={{ color: 'var(--encre-3)', fontSize: '0.85rem' }}>{f.accroche}</p>
            </div>
          ))}
        </div>

        {/* Modal modification schémas */}
        {modifierSchemas && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem',
          }} onClick={() => setModifierSchemas(false)}>
            <div className="carte" style={{ maxWidth: 550, maxHeight: '85vh', overflow: 'auto', padding: '1.5rem' }}
              onClick={e => e.stopPropagation()}>
              <h3>Tes schémas de fond</h3>
              <p style={{ color: 'var(--encre-2)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                Ajuste les schémas que tu veux explorer. Tu pourras les changer quand tu veux.
              </p>
              <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.2rem' }}>
                {FAMILLES_SCHEMAS.map(fam => (
                  <details key={fam.id} open={fam.id === 'autres' || fam.id === 'rejet'}>
                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--sauge-fonce)', padding: '0.4rem 0' }}>
                      {fam.nom}
                    </summary>
                    <div style={{ marginTop: '0.5rem', paddingLeft: '0.8rem', display: 'grid', gap: '0.4rem' }}>
                      {SCHEMAS.filter(s => s.famille === fam.id).map(s => (
                        <label key={s.id} style={{ display: 'flex', gap: '0.6rem', cursor: 'pointer', padding: '0.3rem 0' }}>
                          <input type="checkbox" checked={(profil.schemas || []).includes(s.id)}
                            onChange={e => {
                              const newSchemas = e.target.checked
                                ? [...(profil.schemas || []), s.id]
                                : (profil.schemas || []).filter(x => x !== s.id);
                              stockage.setProfil({ ...profil, schemas: newSchemas });
                            }}
                            style={{ marginTop: '2px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.nom}</div>
                            <div style={{ color: 'var(--encre-3)', fontSize: '0.8rem' }}>{s.croyance}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-doux" onClick={() => setModifierSchemas(false)}>
                  Fermer
                </button>
                <button className="btn btn-primaire" onClick={() => setModifierSchemas(false)}>
                  Enregistré ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
