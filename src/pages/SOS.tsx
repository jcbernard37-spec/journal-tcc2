import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOS_ETAPES } from '../data/tcc';

export default function SOS() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(0);
  const derniere = etape >= SOS_ETAPES.length - 1;

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ paddingTop: '2.2rem', textAlign: 'center' }}>
        <h1>On y va ensemble, une étape à la fois</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.5rem' }}>
          Ce moment est inconfortable, pas dangereux. Suis simplement l'étape en cours.
        </p>

        <div className="progression" style={{ margin: '1.6rem auto', maxWidth: 420 }}>
          <div style={{ width: `${((etape + 1) / SOS_ETAPES.length) * 100}%` }} />
        </div>

        {etape === 0 && <div className="cercle-souffle" style={{ marginBottom: '1.6rem' }} aria-hidden="true" />}

        <div className="carte" style={{ textAlign: 'left' }}>
          <span className="etiquette etiquette-sauge">Étape {etape + 1} / {SOS_ETAPES.length}</span>
          <h2 style={{ margin: '0.7rem 0 0.5rem' }}>{SOS_ETAPES[etape].titre}</h2>
          <p style={{ color: 'var(--encre-2)', fontSize: '1.05rem' }}>{SOS_ETAPES[etape].texte}</p>

          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
            {etape > 0 && (
              <button className="btn btn-doux" onClick={() => setEtape(e => e - 1)}>← Précédente</button>
            )}
            {!derniere ? (
              <button className="btn btn-primaire" onClick={() => setEtape(e => e + 1)}>
                C'est fait, étape suivante →
              </button>
            ) : (
              <>
                <button className="btn btn-primaire" onClick={() => navigate('/feuille/parking')}>
                  Garer mon inquiétude 🅿️
                </button>
                <button className="btn btn-ambre" onClick={() => navigate('/feuille/actionnable')}>
                  Passer à l'arbre actionnable 🌳
                </button>
              </>
            )}
          </div>
        </div>

        <div className="encart encart-crise" style={{ textAlign: 'left', marginTop: '2rem' }}>
          <strong>Si tu traverses quelque chose de plus grave</strong> — des pensées de te faire
          du mal, une détresse qui déborde — tu mérites un vrai soutien humain, tout de suite :
          <div style={{ marginTop: '0.6rem', fontSize: '1.05rem', lineHeight: 1.9 }}>
            📞 <strong>3114</strong> — numéro national de prévention du suicide, gratuit, 24h/24<br />
            🚑 <strong>15</strong> — SAMU &nbsp;·&nbsp; 🚨 <strong>112</strong> — urgences européennes
          </div>
          Tu peux aussi appeler un proche de confiance, maintenant. Ce journal est un outil
          de bien-être, pas une ressource de crise.
        </div>
      </div>
    </div>
  );
}
