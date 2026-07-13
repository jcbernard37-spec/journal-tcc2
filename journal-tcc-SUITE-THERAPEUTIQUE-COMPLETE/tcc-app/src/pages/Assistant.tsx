import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { converserAvecCompagnon, MessageChat } from '../lib/ia';
import { stockage } from '../lib/storage';
import { BoutonMicro } from '../lib/BoutonMicro';

// Suggestions d'amorce pour démarrer
const AMORCES = [
  'Je rumine et je n\'arrive pas à m\'arrêter',
  'Je me sens angoissé·e là, maintenant',
  'Une situation m\'a blessé·e aujourd\'hui',
  'Je ne sais pas par où commencer',
];

// Détecte si l'IA suggère un outil, pour afficher un raccourci
const OUTILS_LIENS: { motif: RegExp; slug: string; label: string }[] = [
  { motif: /journal de pensées|BEC/i, slug: 'bec', label: '📋 Ouvrir le Journal de pensées' },
  { motif: /arbre actionnable|actionnable ou pas/i, slug: 'actionnable', label: '🌳 Ouvrir l\'Arbre actionnable' },
  { motif: /parking/i, slug: 'parking', label: '🅿️ Ouvrir le Parking à inquiétudes' },
  { motif: /labo de prédictions|prédiction/i, slug: 'predictions', label: '🔬 Ouvrir le Labo de prédictions' },
  { motif: /décatastrophisation|pire scénario/i, slug: 'decatastrophisation', label: '⚖️ Ouvrir la Décatastrophisation' },
  { motif: /schémas? profonds?|sacrifice de soi|abandon/i, slug: 'schemas', label: '🧠 Ouvrir Mes schémas profonds' },
  { motif: /comportements? de sécurité/i, slug: 'securite', label: '🛡️ Ouvrir Comportements de sécurité' },
  { motif: /plan de crise/i, slug: 'crise', label: '🆘 Ouvrir le Plan de crise' },
];

export default function Assistant() {
  const navigate = useNavigate();
  const profil = stockage.getProfil();
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [saisie, setSaisie] = useState('');
  const [chargement, setChargement] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

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

  // Cherche un outil suggéré dans le dernier message de l'assistant
  const dernierAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const outilSuggere = dernierAssistant
    ? OUTILS_LIENS.find(o => o.motif.test(dernierAssistant.content))
    : null;

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ paddingTop: '2rem' }}>
        <h1>💬 Parler à l'assistant</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem' }}>
          Dis-moi ce que tu ressens maintenant. Je t'aide à y voir clair et je t'oriente
          vers le bon outil. Je ne remplace pas ta thérapeute — je t'accompagne entre les séances.
        </p>

        {/* Zone de conversation */}
        <div className="carte" style={{ marginTop: '1.4rem', minHeight: 300, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {messages.length === 0 && (
            <div style={{ color: 'var(--encre-3)', textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
              {profil ? `Bonjour ${profil.prenom}. ` : ''}Par quoi commençons-nous ?
            </div>
          )}

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
            <div style={{ alignSelf: 'flex-start', color: 'var(--encre-3)', fontStyle: 'italic', padding: '0.5rem 1rem' }}>
              L'assistant réfléchit…
            </div>
          )}
          <div ref={finRef} />
        </div>

        {/* Raccourci vers l'outil suggéré */}
        {outilSuggere && !chargement && (
          <button
            className="btn btn-ambre apparition"
            style={{ width: '100%', marginTop: '0.8rem' }}
            onClick={() => navigate(`/feuille/${outilSuggere.slug}`)}
          >
            {outilSuggere.label}
          </button>
        )}

        {/* Amorces (au démarrage seulement) */}
        {messages.length === 0 && (
          <div className="puces" style={{ marginTop: '1rem' }}>
            {AMORCES.map(a => (
              <button key={a} type="button" className="puce" onClick={() => envoyer(a)}>
                {a}
              </button>
            ))}
          </div>
        )}

        {/* Zone de saisie */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'flex-end' }}>
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
            placeholder="Écris ou dicte ce que tu ressens…"
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

        <div className="encart encart-crise" style={{ marginTop: '1.4rem', fontSize: '0.9rem' }}>
          <strong>En cas de détresse importante</strong> — pensées de te faire du mal, souffrance
          qui déborde : appelle le <strong>3114</strong> (prévention suicide, gratuit, 24h/24),
          le <strong>15</strong> (SAMU), ou un proche de confiance. Cet assistant est un outil de
          bien-être, pas un service d'urgence.
        </div>
      </div>
    </div>
  );
}
