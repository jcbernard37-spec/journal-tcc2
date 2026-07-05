import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAD7_QUESTIONS, interpretationGAD7, SCHEMAS } from '../data/tcc';
import { stockage } from '../lib/storage';

const OPTIONS_GAD7 = ['Jamais', 'Plusieurs jours', 'Plus de la moitié des jours', 'Presque tous les jours'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(0);
  const [prenom, setPrenom] = useState('');
  const [gad7, setGad7] = useState<number[]>(Array(7).fill(-1));
  const [schemas, setSchemas] = useState<string[]>([]);

  const score = gad7.reduce((a, b) => a + Math.max(b, 0), 0);
  const gad7Complet = gad7.every(v => v >= 0);

  const terminer = () => {
    stockage.setProfil({ prenom: prenom.trim(), gad7, schemas, creeLe: new Date().toISOString() });
    navigate('/hub');
  };

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ paddingTop: '2.5rem' }}>
        <div className="progression" style={{ marginBottom: '2rem' }}>
          <div style={{ width: `${((etape + 1) / 3) * 100}%` }} />
        </div>

        {etape === 0 && (
          <div className="carte">
            <span className="etiquette etiquette-sauge">Étape 1 / 3</span>
            <h2 style={{ margin: '0.8rem 0 0.4rem' }}>Bienvenue dans ton journal</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.5rem' }}>
              Quelques minutes pour préparer ton espace. Tout reste sur ton appareil.
            </p>
            <div className="champ">
              <label htmlFor="prenom">Comment veux-tu qu'on t'appelle ?</label>
              <input
                id="prenom" type="text" value={prenom} placeholder="Ton prénom"
                onChange={e => setPrenom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && prenom.trim() && setEtape(1)}
              />
            </div>
            <button className="btn btn-primaire" disabled={!prenom.trim()} onClick={() => setEtape(1)}>
              Continuer →
            </button>
          </div>
        )}

        {etape === 1 && (
          <div className="carte">
            <span className="etiquette etiquette-sauge">Étape 2 / 3</span>
            <h2 style={{ margin: '0.8rem 0 0.4rem' }}>Questionnaire GAD-7</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.5rem' }}>
              Sur les <strong>2 dernières semaines</strong>, à quelle fréquence as-tu été
              gêné·e par les problèmes suivants ? Ce score te servira de point de départ
              pour mesurer ton évolution.
            </p>

            {GAD7_QUESTIONS.map((q, i) => (
              <div key={i} className="champ">
                <label>{i + 1}. {q}</label>
                <div className="puces">
                  {OPTIONS_GAD7.map((opt, val) => (
                    <button
                      key={val} type="button"
                      className={'puce' + (gad7[i] === val ? ' choisie' : '')}
                      onClick={() => setGad7(g => g.map((x, j) => (j === i ? val : x)))}
                    >
                      {opt} ({val})
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {gad7Complet && (
              <div className="encart encart-succes">
                <strong>Ton score : {score} / 21 — {interpretationGAD7(score).niveau}.</strong>
                <br />{interpretationGAD7(score).conseil}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1rem' }}>
              <button className="btn btn-doux" onClick={() => setEtape(0)}>← Retour</button>
              <button className="btn btn-primaire" disabled={!gad7Complet} onClick={() => setEtape(2)}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {etape === 2 && (
          <div className="carte">
            <span className="etiquette etiquette-sauge">Étape 3 / 3</span>
            <h2 style={{ margin: '0.8rem 0 0.4rem' }}>Tes schémas déjà identifiés</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.5rem' }}>
              <strong>Optionnel.</strong> Si un travail avec un·e thérapeute a déjà mis en
              lumière certains schémas, coche-les : la feuille « Mes schémas profonds »
              s'appuiera dessus. Sinon, passe cette étape — tu pourras les découvrir en chemin.
            </p>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {SCHEMAS.map(s => (
                <button
                  key={s.id} type="button"
                  className="carte carte-clic"
                  style={{
                    padding: '0.9rem 1.1rem', textAlign: 'left',
                    border: schemas.includes(s.id) ? '2px solid var(--sauge)' : '1px solid var(--lin-2)',
                    background: schemas.includes(s.id) ? 'var(--sauge-pale)' : 'white',
                    fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer',
                  }}
                  onClick={() => setSchemas(sc => sc.includes(s.id) ? sc.filter(x => x !== s.id) : [...sc, s.id])}
                >
                  <strong>{schemas.includes(s.id) ? '✓ ' : ''}{s.nom}</strong>
                  <div style={{ color: 'var(--encre-2)', fontSize: '0.88rem' }}>{s.croyance}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.5rem' }}>
              <button className="btn btn-doux" onClick={() => setEtape(1)}>← Retour</button>
              <button className="btn btn-primaire" onClick={terminer}>
                Créer mon espace ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
