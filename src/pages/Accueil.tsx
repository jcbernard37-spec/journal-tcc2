import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Accueil() {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const sessions = localStorage.getItem('tcc_sessions_therapie');
    const anamnese = localStorage.getItem('tcc_anamnese');
    setHasStarted(!!(sessions || anamnese));
  }, []);

  return (
    <div className="page" style={{ background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4rem 1.5rem 3rem',
        position: 'relative',
      }}>

        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'var(--accent-pale)', opacity: 0.5, zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--chaud-pale)', opacity: 0.4, zIndex: 0 }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '18px',
            background: 'var(--accent)', marginBottom: '1.25rem',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--accent) 35%, transparent)',
          }}>
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
              <path d="M2 22 Q12 6 20 14 Q28 22 38 6" stroke="#C8A050" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <circle cx="38" cy="6" r="3" fill="#C8A050"/>
            </svg>
          </div>

          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 700, color: 'var(--encre)', lineHeight: 0.9, letterSpacing: '-0.03em' }}>
            Solco
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--encre-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
            Le carnet augmenté
          </div>
        </div>

        {/* Tagline */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px', marginBottom: '3rem' }}>
          <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'var(--encre-2)', lineHeight: 1.6, margin: 0 }}>
            Entre chaque séance avec ton thérapeute,<br />
            <strong style={{ color: 'var(--encre)' }}>Solco est là.</strong>
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--encre-3)', marginTop: '0.85rem', lineHeight: 1.5 }}>
            TCC · EMDR · Yoga Nidra · Hypnose · Visualisations · Tapping
          </p>
        </div>

        {/* CTA */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {hasStarted ? (
            <>
              <Link to="/hub">
                <button style={{ padding: '1rem 2rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent)' }}>
                  Reprendre mon travail →
                </button>
              </Link>
              <Link to="/outils-therapeutiques">
                <button style={{ padding: '1rem 2rem', borderRadius: '999px', background: 'transparent', color: 'var(--encre)', border: '2px solid var(--carte-border)', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer' }}>
                  Outils guidés
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/onboarding">
                <button style={{ padding: '1.1rem 2.2rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
                  Commencer mon carnet →
                </button>
              </Link>
              <Link to="/hub">
                <button style={{ padding: '1rem 2rem', borderRadius: '999px', background: 'transparent', color: 'var(--encre)', border: '2px solid var(--carte-border)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                  Explorer d'abord
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'var(--encre-3)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
          <span>Découvrir</span>
          <span style={{ fontSize: '1.2rem' }}>↓</span>
        </div>
      </div>

      {/* ── PROBLÈME ── */}
      <div style={{ background: 'var(--carte-bg)', padding: '4rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--carte-border)', borderBottom: '1px solid var(--carte-border)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>Le vrai problème</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2, marginBottom: '1.5rem', color: 'var(--encre)' }}>
            La thérapie, c'est 1 heure par semaine.<br />
            <span style={{ color: 'var(--accent)' }}>Le reste du temps, tu es seule.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--encre-2)', lineHeight: 1.7 }}>
            Les pensées reviennent à 3h du matin. L'anxiété pointe quand ton thérapeute est en vacances.
            Les outils qu'on t'a donnés sont dans un carnet que tu ne retrouves plus.
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--encre-2)', lineHeight: 1.7, marginTop: '1rem' }}>
            <strong style={{ color: 'var(--encre)' }}>Solco comble cet espace.</strong> Pas à la place du thérapeute. À côté.
          </p>
        </div>
      </div>

      {/* ── OUTILS ── */}
      <div style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', textAlign: 'center', marginBottom: '0.75rem' }}>Ce que Solco contient</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center', marginBottom: '2.5rem', color: 'var(--encre)' }}>
          Tout ce dont tu as besoin, au même endroit
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '📋', titre: '13 Feuilles TCC', desc: 'Colonnes de Beck, distorsions, schémas profonds. Le travail cognitif structuré de la TCC.', lien: '/feuilles', couleur: '#4A7A6F' },
            { icon: '🎯', titre: 'EMDR Guidé', desc: 'Stimulation bilatérale + voix guidée. Pour traiter les peurs et mémoires douloureuses.', lien: '/emdr', couleur: '#FF6B6B' },
            { icon: '🧘', titre: 'Yoga Nidra', desc: 'Scripts de 15 à 60 min avec voix professionnelle et musique zen générée.', lien: '/yoga-nidra', couleur: '#4ECDC4' },
            { icon: '🌀', titre: 'Hypnose Ericksonienne', desc: 'Inductions guidées pour changer des croyances et ancrer des ressources.', lien: '/hypnose', couleur: '#9D84B7' },
            { icon: '🌟', titre: 'Visualisations', desc: '6 voyages narratifs : guérison, enfant intérieur, abondance, safe place…', lien: '/visualisations', couleur: '#FFD93D' },
            { icon: '🎁', titre: 'Outils Bonus', desc: 'Tapping EFT, cohérence cardiaque, méditation bienveillance, affirmations.', lien: '/outils-bonus', couleur: '#6BCF7F' },
          ].map(o => (
            <Link to={o.lien} key={o.titre} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--carte-bg)', border: '1px solid var(--carte-border)',
                borderTop: `3px solid ${o.couleur}`, borderRadius: '14px',
                padding: '1.5rem', cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: 'var(--ombre)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--ombre)'; }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{o.icon}</div>
                <div style={{ fontWeight: 700, color: 'var(--encre)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>{o.titre}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--encre-2)', lineHeight: 1.5 }}>{o.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── DIFFÉRENCIATION ── */}
      <div style={{ background: 'var(--accent)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
            Ce qui nous rend différents
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white', marginBottom: '2rem', lineHeight: 1.3 }}>
            Pas une app de méditation générique.<br />Un carnet qui te connaît.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { chiffre: '16', label: 'Scripts thérapeutiques guidés' },
              { chiffre: '13', label: 'Feuilles TCC structurées' },
              { chiffre: '4', label: 'Ambiances visuelles' },
              { chiffre: '1', label: 'App tout-en-un en français' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', fontFamily: "'Fraunces', serif" }}>{s.chiffre}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌱</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1rem', color: 'var(--encre)' }}>
            Commence à creuser ton sillon.
          </h2>
          <p style={{ color: 'var(--encre-2)', marginBottom: '2rem', fontSize: '1rem' }}>
            Le changement ne vient pas d'une séance. Il vient du travail quotidien, patient, ancré.
          </p>
          <Link to={hasStarted ? '/hub' : '/onboarding'}>
            <button style={{ padding: '1.1rem 2.5rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
              {hasStarted ? 'Reprendre mon carnet →' : 'Ouvrir mon carnet →'}
            </button>
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--encre-3)' }}>
            Gratuit · Privé · Tes données restent sur ton appareil
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--carte-border)', fontSize: '0.8rem', color: 'var(--encre-3)' }}>
        <strong style={{ fontFamily: "'Fraunces', serif", color: 'var(--encre-2)' }}>Solco</strong> — Le carnet augmenté &nbsp;·&nbsp;
        Outil de soutien personnel. Ne remplace pas un suivi thérapeutique professionnel.
      </div>

    </div>
  );
}
