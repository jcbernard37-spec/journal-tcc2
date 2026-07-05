import { useNavigate } from 'react-router-dom';
import { FEUILLES } from '../data/tcc';
import { stockage } from '../lib/storage';

export default function FeuillesHub() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="conteneur apparition" style={{ paddingTop: '2.2rem' }}>
        <h1>Les 10 feuilles de travail</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem', maxWidth: 640 }}>
          Chaque feuille existe en deux versions : <strong>numérique</strong> (tu remplis à
          l'écran, tout est sauvegardé) et <strong>papier</strong> (un clic sur « Imprimer »
          produit une fiche propre à remplir à la main). Aucun ordre imposé.
        </p>

        <div style={{ display: 'grid', gap: '1.1rem', marginTop: '2rem' }}>
          {FEUILLES.map((f, i) => {
            const nb = stockage.getEntrees(f.slug).length;
            return (
              <div key={f.slug} className="carte fiche carte-clic"
                style={{ ['--fiche-couleur' as string]: f.couleur }}
                onClick={() => navigate(`/feuille/${f.slug}`)}>
                <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '2rem', lineHeight: 1 }}>{f.icone}</div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>{i + 1}. {f.titre}</h3>
                      {nb > 0 && <span className="etiquette etiquette-sauge">{nb} entrée{nb > 1 ? 's' : ''}</span>}
                    </div>
                    <p style={{ color: 'var(--encre-2)', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
                      {f.accroche}
                    </p>
                  </div>
                  <span style={{ color: f.couleur, fontWeight: 800, whiteSpace: 'nowrap' }}>Ouvrir →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
