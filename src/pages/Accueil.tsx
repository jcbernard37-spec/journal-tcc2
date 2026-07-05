import { useNavigate } from 'react-router-dom';
import { stockage } from '../lib/storage';

export default function Accueil() {
  const navigate = useNavigate();
  const profil = stockage.getProfil();

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ textAlign: 'center', paddingTop: '3.5rem' }}>
        <div className="cercle-souffle" aria-hidden="true" />
        <p style={{ marginTop: '1.5rem', color: 'var(--encre-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.82rem' }}>
          INSPIRE... EXPIRE...
        </p>

        <h1 style={{ marginTop: '1.5rem' }}>
          Un espace pour comprendre<br />et apprivoiser ton anxiété
        </h1>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--encre-2)', maxWidth: 560, marginInline: 'auto' }}>
          Un journal fondé sur la thérapie cognitivo-comportementale : dix feuilles de travail
          guidées, utilisables à l'écran ou sur papier, pour observer tes pensées et
          reprendre la main, pas à pas.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          {profil ? (
            <button className="btn btn-primaire" onClick={() => navigate('/hub')}>
              Continuer, {profil.prenom} →
            </button>
          ) : (
            <button className="btn btn-primaire" onClick={() => navigate('/onboarding')}>
              Commencer mon parcours
            </button>
          )}
          <button className="btn btn-contour" onClick={() => navigate('/feuilles')}>
            Découvrir les feuilles
          </button>
        </div>
      </div>

      <div className="conteneur" style={{ marginTop: '4rem' }}>
        <div className="grille-3">
          <div className="carte">
            <div style={{ fontSize: '1.8rem' }}>🧭</div>
            <h3 style={{ margin: '0.6rem 0 0.4rem' }}>Comprendre</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              Chaque feuille explique <em>pourquoi</em> elle fonctionne, avec des exemples
              concrets tirés du quotidien.
            </p>
          </div>
          <div className="carte">
            <div style={{ fontSize: '1.8rem' }}>✍️</div>
            <h3 style={{ margin: '0.6rem 0 0.4rem' }}>Écran ou papier</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              Remplis directement dans l'application, ou imprime une version papier
              soignée d'un simple clic.
            </p>
          </div>
          <div className="carte">
            <div style={{ fontSize: '1.8rem' }}>🌱</div>
            <h3 style={{ margin: '0.6rem 0 0.4rem' }}>Progresser</h3>
            <p style={{ color: 'var(--encre-2)', fontSize: '0.95rem' }}>
              Ton historique et tes tests de prédictions s'accumulent : des preuves
              tangibles de ton chemin.
            </p>
          </div>
        </div>

        <div className="encart encart-info" style={{ marginTop: '2.5rem', maxWidth: 720, marginInline: 'auto' }}>
          <strong>Un compagnon, pas un remplaçant.</strong> Ce journal complète un suivi avec
          un professionnel de santé — il ne s'y substitue jamais. Si tu traverses un moment
          très difficile, le bouton <strong>SOS</strong> en haut à droite est toujours là.
        </div>
      </div>
    </div>
  );
}
