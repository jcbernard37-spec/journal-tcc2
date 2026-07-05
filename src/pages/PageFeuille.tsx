import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EMOTIONS, DISTORSIONS, FEUILLES, ChampFeuille } from '../data/tcc';
import { stockage, formaterDate } from '../lib/storage';

// ── Sélecteur d'émotions (100+, par familles) ──
function SelecteurEmotions({ valeur, onChange }: { valeur: string[]; onChange: (v: string[]) => void }) {
  const basculer = (e: string) =>
    onChange(valeur.includes(e) ? valeur.filter(x => x !== e) : [...valeur, e]);

  return (
    <div>
      {valeur.length > 0 && (
        <div className="encart encart-succes" style={{ marginTop: 0 }}>
          <strong>Sélectionnées :</strong> {valeur.join(' · ')}
        </div>
      )}
      {EMOTIONS.map(fam => (
        <details key={fam.categorie} style={{ marginBottom: '0.7rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 800, color: fam.couleur, padding: '0.3rem 0' }}>
            {fam.categorie} <span style={{ color: 'var(--encre-3)', fontWeight: 400 }}>({fam.liste.length})</span>
          </summary>
          <div className="puces" style={{ padding: '0.5rem 0 0.3rem' }}>
            {fam.liste.map(e => (
              <button key={e} type="button"
                className={'puce' + (valeur.includes(e) ? ' choisie' : '')}
                style={valeur.includes(e) ? { background: fam.couleur, borderColor: fam.couleur } : {}}
                onClick={() => basculer(e)}>
                {e}
              </button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

// ── Sélecteur de distorsions (dépliables avec définition + antidotes) ──
function SelecteurDistorsions({ valeur, onChange }: { valeur: string[]; onChange: (v: string[]) => void }) {
  const basculer = (d: string) =>
    onChange(valeur.includes(d) ? valeur.filter(x => x !== d) : [...valeur, d]);

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {DISTORSIONS.map(d => {
        const active = valeur.includes(d.nom);
        return (
          <details key={d.nom} style={{
            border: active ? '2px solid var(--sauge)' : '1px solid var(--lin-2)',
            borderRadius: 'var(--rayon-sm)', background: active ? 'var(--sauge-pale)' : 'white',
            padding: '0.7rem 0.9rem',
          }}>
            <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
              <input type="checkbox" checked={active} onChange={() => basculer(d.nom)}
                onClick={ev => ev.stopPropagation()} style={{ width: 18, height: 18, accentColor: 'var(--sauge)' }} />
              {d.nom}
            </summary>
            <div style={{ marginTop: '0.6rem', fontSize: '0.92rem' }}>
              <p><strong>Définition :</strong> {d.def}</p>
              <p style={{ marginTop: '0.3rem', color: 'var(--encre-2)' }}><strong>Exemple :</strong> {d.ex}</p>
              <p style={{ marginTop: '0.3rem' }}><strong>Questions-antidotes :</strong></p>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--encre-2)' }}>
                {d.questions.map(q => <li key={q}>{q}</li>)}
              </ul>
            </div>
          </details>
        );
      })}
    </div>
  );
}

// ── Rendu d'un champ selon son type ──
function Champ({ champ, valeur, onChange, imprimer }: {
  champ: ChampFeuille; valeur: unknown; onChange: (v: unknown) => void; imprimer: boolean;
}) {
  return (
    <div className="champ">
      <label>{champ.label}</label>
      {'aide' in champ && champ.aide && <p className="aide">{champ.aide}</p>}

      {champ.type === 'texte' && (
        <input type="text" value={(valeur as string) || ''} placeholder={champ.placeholder}
          onChange={e => onChange(e.target.value)} />
      )}
      {champ.type === 'zone' && (
        <>
          <textarea className="no-print" value={(valeur as string) || ''} placeholder={champ.placeholder}
            onChange={e => onChange(e.target.value)} />
          {imprimer && <div className="zone-ecriture-print" />}
        </>
      )}
      {champ.type === 'curseur' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--encre-3)', fontSize: '0.85rem' }}>0 — calme</span>
            <span style={{ fontSize: '1.3rem', color: 'var(--sauge-fonce)' }}>{(valeur as number) ?? 50}</span>
            <span style={{ color: 'var(--encre-3)', fontSize: '0.85rem' }}>100 — maximum</span>
          </div>
          <input type="range" min={0} max={100} value={(valeur as number) ?? 50}
            onChange={e => onChange(Number(e.target.value))} className="no-print" />
          {imprimer && <div className="zone-ecriture-print" style={{ minHeight: 40 }} />}
        </div>
      )}
      {champ.type === 'emotions' && (
        <SelecteurEmotions valeur={(valeur as string[]) || []} onChange={onChange as (v: string[]) => void} />
      )}
      {champ.type === 'distorsions' && (
        <SelecteurDistorsions valeur={(valeur as string[]) || []} onChange={onChange as (v: string[]) => void} />
      )}
      {champ.type === 'choix' && (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {champ.options.map(opt => (
            <button key={opt} type="button"
              className={'puce' + (valeur === opt ? ' choisie' : '')}
              style={{ textAlign: 'left', borderRadius: 'var(--rayon-sm)', padding: '0.7rem 1rem' }}
              onClick={() => onChange(valeur === opt ? '' : opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Résumé lisible d'une entrée d'historique ──
function ResumeEntree({ valeurs }: { valeurs: Record<string, unknown> }) {
  const morceaux = Object.entries(valeurs)
    .filter(([, v]) => v !== '' && v !== undefined && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k.replace(/_/g, ' ')} : ${Array.isArray(v) ? v.join(', ') : String(v)}`);
  return (
    <div style={{ fontSize: '0.92rem', color: 'var(--encre-2)', whiteSpace: 'pre-wrap' }}>
      {morceaux.map(m => <div key={m} style={{ marginTop: '0.2rem' }}>• {m}</div>)}
    </div>
  );
}

export default function PageFeuille() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const feuille = FEUILLES.find(f => f.slug === slug);
  const [valeurs, setValeurs] = useState<Record<string, unknown>>({});
  const [sauvegarde, setSauvegarde] = useState(false);
  const [cle, setCle] = useState(0); // pour réinitialiser le formulaire
  const historique = useMemo(() => stockage.getEntrees(slug || ''), [slug, sauvegarde, cle]);

  if (!feuille) { navigate('/feuilles'); return null; }

  const enregistrer = () => {
    const rempli = Object.values(valeurs).some(v =>
      (typeof v === 'string' && v.trim()) || (Array.isArray(v) && v.length) || typeof v === 'number');
    if (!rempli) return;
    stockage.ajouterEntree(feuille.slug, valeurs);
    setValeurs({});
    setCle(k => k + 1);
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 2600);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ paddingTop: '2rem' }}>
        <button className="btn btn-doux btn-sm no-print" onClick={() => navigate('/feuilles')}>
          ← Toutes les feuilles
        </button>

        {sauvegarde && (
          <div className="encart encart-succes no-print" role="status">
            ✓ Enregistré dans ton historique. Pense à faire une sauvegarde régulièrement (menu « Sauvegarde »).
          </div>
        )}

        {/* En-tête imprimable */}
        <h1 className="print-titre" style={{ fontSize: '1.6rem' }}>{feuille.icone} {feuille.titre}</h1>

        <div style={{ marginTop: '1.2rem' }}>
          <span className="etiquette" style={{ background: feuille.couleur + '22', color: feuille.couleur }}>
            Feuille de travail TCC
          </span>
          <h1 style={{ marginTop: '0.6rem' }} className="no-print">{feuille.icone} {feuille.titre}</h1>
          <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem', fontSize: '1.05rem' }}>{feuille.accroche}</p>
        </div>

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>💡 Pourquoi ça marche</h3>
          <p style={{ color: 'var(--encre-2)', marginTop: '0.5rem' }}>{feuille.pourquoi}</p>
          {feuille.exemple && (
            <div className="encart encart-exemple" style={{ marginBottom: 0 }}>
              <strong>Exemple concret —</strong> {feuille.exemple}
            </div>
          )}
        </div>

        <div className="carte fiche" style={{ marginTop: '1.4rem', ['--fiche-couleur' as string]: feuille.couleur }}>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.2rem' }}>
            <h3 style={{ margin: 0 }}>✍️ Remplir la feuille</h3>
            <button className="btn btn-contour btn-sm" onClick={() => window.print()}>
              🖨️ Imprimer la version papier
            </button>
          </div>

          <div key={cle}>
            {feuille.champs.map(c => (
              <Champ key={c.id} champ={c} imprimer
                valeur={valeurs[c.id]}
                onChange={v => setValeurs(vs => ({ ...vs, [c.id]: v }))} />
            ))}
          </div>

          <button className="btn btn-primaire no-print" onClick={enregistrer} style={{ width: '100%' }}>
            Enregistrer cette entrée ✓
          </button>
        </div>

        {historique.length > 0 && (
          <div className="carte no-print" style={{ marginTop: '1.4rem' }}>
            <h3>📚 Mon historique ({historique.length})</h3>
            {historique.map(e => (
              <div key={e.id} className="entree-histo">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="entree-date">{formaterDate(e.date)}</span>
                  <button className="btn btn-doux btn-sm"
                    onClick={() => { stockage.supprimerEntree(e.id); setCle(k => k + 1); }}>
                    Supprimer
                  </button>
                </div>
                <ResumeEntree valeurs={e.valeurs} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
