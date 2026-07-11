import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { stockage } from '../lib/storage';
import { converserAvecCompagnon, MessageChat } from '../lib/ia';
import { BoutonMicro } from '../lib/BoutonMicro';

export default function Accueil() {
  const navigate = useNavigate();
  const profil = stockage.getProfil();
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [saisie, setSaisie] = useState('');
  const [chargement, setChargement] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  if (profil) {
    navigate('/hub');
    return null;
  }

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chargement]);

  const envoyer = async (texte: string) => {
    const message = texte.trim();
    if (!message || chargement) return;

    const nouveauxMessages: MessageChat[] = [...messages, { role: 'user', content: message }];
    setMessages(nouveauxMessages);
    setSaisie('');
    setChargement(true);

    const { ok, texte: reponse } = await converserAvecCompagnon(nouveauxMessages);
    setMessages([...nouveauxMessages, { role: 'assistant', content: ok ? reponse : reponse }]);
    setChargement(false);
  };

  // Si conversation démarrée, affiche le chat
  if (messages.length > 0) {
    return (
      <div className="page">
        <div className="conteneur-etroit apparition" style={{ paddingTop: '2rem' }}>
          <h1>💬 Parlons de ce que tu ressens</h1>
          <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem', marginBottom: '1.4rem' }}>
            Je suis là pour t'aider à trouver le bon outil pour toi.
          </p>

          {/* Zone de conversation */}
          <div className="carte" style={{ marginBottom: '1rem', minHeight: 250, display: 'flex', flexDirection: 'column', gap: '0.9rem', overflowY: 'auto', maxHeight: 400 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'var(--sauge)' : 'var(--lin-2)',
                color: m.role === 'user' ? 'white' : 'var(--encre)',
                padding: '0.7rem 1rem',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            ))}
            {chargement && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--encre-3)', fontStyle: 'italic' }}>
                L'assistant réfléchit…
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Zone de saisie */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <BoutonMicro onTexteDicte={t => setSaisie(s => (s ? s + ' ' : '') + t)} />
            <textarea
              value={saisie}
              onChange={e => setSaisie(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  envoyer(saisie);
                }
              }}
              placeholder="Dis-moi ce que tu ressens…"
              style={{
                flex: 1, padding: '0.8rem 1rem', borderRadius: 'var(--rayon-sm)',
                border: '1.5px solid #DDD5C7', fontFamily: 'inherit', fontSize: '1rem',
                resize: 'none', minHeight: 52, maxHeight: 120,
              }}
              rows={1}
            />
            <button
              className="btn btn-primaire"
              onClick={() => envoyer(saisie)}
              disabled={chargement || !saisie.trim()}
              style={{ alignSelf: 'stretch' }}
            >
              Envoyer
            </button>
          </div>

          <button className="btn btn-doux" onClick={() => {
            setMessages([]);
            setSaisie('');
          }} style={{ marginTop: '1rem', width: '100%' }}>
            ← Recommencer
          </button>

          <div className="encart encart-info" style={{ marginTop: '1.4rem', fontSize: '0.9rem' }}>
            <strong>Besoin d'aide immédiate ?</strong> Clique sur le bouton <strong>SOS</strong> en haut à droite.
          </div>
        </div>
      </div>
    );
  }

  // Page d'accueil initiale
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
          <button className="btn btn-primaire" onClick={() => setMessages([{ role: 'assistant', content: 'Bonjour ! 👋 Je suis ton assistant TCC. Qu\'est-ce que tu fais là aujourd\'hui ? Qu\'est-ce que tu ressens en ce moment ?' }])}>
            Parler à l'assistant →
          </button>
          <button className="btn btn-contour" onClick={() => navigate('/onboarding')}>
            Commencer mon profil
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
