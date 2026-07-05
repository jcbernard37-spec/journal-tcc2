import { useNavigate } from 'react-router-dom';
import { FEUILLES } from '../data/tcc';
import { stockage } from '../lib/storage';

export default function Hub() {
  const navigate = useNavigate();
  const profil = stockage.getProfil();
  const entrees = stockage.getEntrees();
  const cetteSemaine = entrees.filter(e => Date.now() - new Date(e.date).getTime() < 7 * 86400000).length;

  if (!profil) {
    navigate('/onboarding');
    return null;
  }

  const heure = new Date().getHours();
  const salut = heure < 6 ? 'Bonsoir' : heure < 18 ? 'Bonjour' : 'Bonsoir';

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

        <h2 style={{ marginTop: '2.8rem' }}>Par où commencer aujourd'hui ?</h2>
        <div className="grille-2" style={{ marginTop: '1.2rem' }}>
          <div className="carte fiche carte-clic" style={{ ['--fiche-couleur' as string]: '#4A7A6F' }}
            onClick={() => navigate('/feuille/bec')}>
            <span className="etiquette etiquette-sauge">Le classique</span>
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>📋 Journal de pensées (BEC)</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              Une émotion forte aujourd'hui ? C'est ici qu'on la décortique.
            </p>
          </div>
          <div className="carte fiche carte-clic" style={{ ['--fiche-couleur' as string]: '#B5544D' }}
            onClick={() => navigate('/sos')}>
            <span className="etiquette" style={{ background: 'var(--crise-pale)', color: 'var(--crise)' }}>Urgence douce</span>
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>🆘 Ça tourne en boucle ?</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              5 étapes guidées pour interrompre la rumination, avec respiration animée.
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
      </div>
    </div>
  );
}
