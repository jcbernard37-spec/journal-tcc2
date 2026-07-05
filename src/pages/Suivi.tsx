import { FEUILLES } from '../data/tcc';
import { stockage, formaterDate } from '../lib/storage';

export default function Suivi() {
  const entrees = stockage.getEntrees();
  const profil = stockage.getProfil();

  // Bilan du labo de prédictions
  const predictions = stockage.getEntrees('predictions');
  const verdicts = predictions.map(p => String(p.valeurs['verdict'] || ''));
  const fausses = verdicts.filter(v => v.startsWith('❌')).length;
  const partielles = verdicts.filter(v => v.startsWith('🌗')).length;
  const vraies = verdicts.filter(v => v.startsWith('✔️')).length;
  const testees = fausses + partielles + vraies;

  // Répartition par feuille
  const parFeuille = FEUILLES
    .map(f => ({ ...f, nb: entrees.filter(e => e.feuille === f.slug).length }))
    .filter(f => f.nb > 0)
    .sort((a, b) => b.nb - a.nb);

  const maxNb = Math.max(1, ...parFeuille.map(f => f.nb));

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ paddingTop: '2.2rem' }}>
        <h1>Mon suivi</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem' }}>
          Des preuves concrètes de ton travail — c'est ça qui compte, pas la perfection.
        </p>

        {testees > 0 && (
          <div className="carte" style={{ marginTop: '1.6rem' }}>
            <h3>🔬 Verdict du labo de prédictions</h3>
            <p style={{ color: 'var(--encre-2)', margin: '0.5rem 0 1rem' }}>
              Sur <strong>{testees}</strong> prédiction{testees > 1 ? 's' : ''} anxieuse{testees > 1 ? 's' : ''} testée{testees > 1 ? 's' : ''} contre la réalité :
            </p>
            <div className="grille-3">
              <div style={{ textAlign: 'center' }}>
                <div className="display" style={{ fontSize: '2rem', color: 'var(--sauge)' }}>{fausses}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--encre-2)', fontWeight: 700 }}>fausses ❌</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="display" style={{ fontSize: '2rem', color: 'var(--ambre)' }}>{partielles}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--encre-2)', fontWeight: 700 }}>bien moins graves 🌗</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="display" style={{ fontSize: '2rem', color: 'var(--bleu-nuit)' }}>{vraies}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--encre-2)', fontWeight: 700 }}>vraies, et surmontées ✔️</div>
              </div>
            </div>
            {fausses + partielles > 0 && (
              <div className="encart encart-succes" style={{ marginBottom: 0 }}>
                {Math.round(((fausses + partielles) / testees) * 100)}% de tes prédictions anxieuses
                ne se sont pas réalisées comme ton anxiété l'annonçait. Garde cette donnée précieusement.
              </div>
            )}
          </div>
        )}

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>📊 Mon activité par feuille</h3>
          {parFeuille.length === 0 ? (
            <p style={{ color: 'var(--encre-2)', marginTop: '0.6rem' }}>
              Pas encore d'entrées. La première feuille remplie apparaîtra ici — le journal
              de pensées (BEC) est un excellent point de départ.
            </p>
          ) : (
            <div style={{ marginTop: '0.9rem', display: 'grid', gap: '0.7rem' }}>
              {parFeuille.map(f => (
                <div key={f.slug}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 700 }}>
                    <span>{f.icone} {f.titre}</span><span>{f.nb}</span>
                  </div>
                  <div className="progression" style={{ marginTop: '0.25rem' }}>
                    <div style={{ width: `${(f.nb / maxNb) * 100}%`, background: f.couleur }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>🕰️ Dernières entrées</h3>
          {entrees.slice(0, 8).map(e => {
            const f = FEUILLES.find(x => x.slug === e.feuille);
            return (
              <div key={e.id} className="entree-histo">
                <span className="entree-date">{formaterDate(e.date)}</span>
                <div style={{ fontWeight: 700 }}>{f?.icone} {f?.titre}</div>
              </div>
            );
          })}
          {entrees.length === 0 && <p style={{ color: 'var(--encre-2)', marginTop: '0.6rem' }}>Rien pour le moment — et c'est très bien de commencer aujourd'hui.</p>}
        </div>

        {profil && (
          <p style={{ color: 'var(--encre-3)', fontSize: '0.85rem', marginTop: '1.4rem', textAlign: 'center' }}>
            Espace créé le {new Date(profil.creeLe).toLocaleDateString('fr-FR')} · GAD-7 de départ :{' '}
            {profil.gad7.reduce((a, b) => a + Math.max(b, 0), 0)}/21
          </p>
        )}
      </div>
    </div>
  );
}
