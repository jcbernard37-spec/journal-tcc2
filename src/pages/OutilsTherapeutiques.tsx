import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SessionTherapie {
  id: string; type: string; nom: string;
  duree: number; date: string; efficacite: number;
}

// lienPro est optionnel (pages bêta Eleven Labs)
const OUTILS_DEF: { id: string; titre: string; desc: string; duree: string; icon: string; couleur: string; lien: string; lienPro?: string }[] = [
  { id: 'emdr',           titre: 'EMDR Visuel',              desc: 'Traite traumas et peurs rapidement',          duree: '5-15 min', icon: '🎯', couleur: '#FF6B6B', lien: '/emdr' },
  { id: 'yoga',           titre: 'Yoga Nidra',               desc: 'Relaxation profonde et recharge',             duree: '15-60 min', icon: '🧘', couleur: '#4ECDC4', lien: '/yoga-nidra', lienPro: '/yoga-nidra-pro' },
  { id: 'hypnose',        titre: 'Hypnose Ericksonienne',    desc: 'Reprogramme tes croyances limitantes',        duree: '20-40 min', icon: '🌀', couleur: '#9D84B7', lien: '/hypnose', lienPro: '/hypnose-pro' },
  { id: 'visualisation',  titre: 'Visualisations Créatrices',desc: 'Manifeste et transforme ta réalité',          duree: '20-50 min', icon: '🌟', couleur: '#FFD93D', lien: '/visualisations', lienPro: '/visualisations-pro' },
  { id: 'bonus',          titre: 'Outils Bonus',             desc: 'Tapping, Cohérence, Méditation, Affirmations',duree: '5-30 min',  icon: '🎁', couleur: '#6BCF7F', lien: '/outils-bonus' },
];

function calcEfficienceOutil(sessions: SessionTherapie[], typeKeyword: string) {
  const filtre = sessions.filter(s =>
    (s.type ?? '').toLowerCase().includes(typeKeyword) ||
    (s.nom  ?? '').toLowerCase().includes(typeKeyword)
  );
  if (filtre.length === 0) return null;
  const avg = filtre.reduce((sum, s) => sum + (s.efficacite || 0), 0) / filtre.length;
  return { count: filtre.length, efficacite: Math.round(avg) };
}

export default function OutilsTherapeutiques() {
  const [sessions, setSessions] = useState<SessionTherapie[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('tcc_sessions_therapie');
    if (stored) try { setSessions(JSON.parse(stored)); } catch (_) {}
  }, []);

  const totalMin   = sessions.reduce((acc, s) => acc + (s.duree || 0), 0);
  const efficMoy   = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.efficacite || 0), 0) / sessions.length)
    : null;

  const sessionsRecentes = [...sessions].reverse().slice(0, 5);

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Outils Thérapeutiques</h1>
          <p style={{ color: 'var(--encre-2)', maxWidth: '480px', margin: '0 auto', fontSize: '0.98rem' }}>
            Transforme tes patterns profonds avec EMDR, Hypnose, Yoga Nidra et Visualisations créatrices.
          </p>
        </div>

        {/* Stats réelles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { val: sessions.length.toString(), label: 'Sessions' },
            { val: efficMoy !== null ? `${efficMoy}%` : '—', label: 'Efficacité moy.' },
            { val: totalMin >= 60 ? `${(totalMin/60).toFixed(1)}h` : `${totalMin}m`, label: 'Temps total' },
          ].map(({ val, label }) => (
            <div key={label} style={{ background: 'var(--carte-bg)', border: '1px solid var(--carte-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--encre-3)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Note psychologique */}
        <div style={{ background: 'var(--bleu-pale)', border: '1px solid color-mix(in srgb, var(--bleu) 25%, transparent)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.88rem', color: 'var(--bleu)' }}>
          <strong>Ces outils complètent, sans remplacer, un suivi thérapeutique professionnel.</strong>
          En cas de détresse ou de trauma sévère, consulte un professionnel de santé mentale. Le bouton <strong>SOS</strong> est disponible en bas à droite à tout moment.
        </div>

        {/* Cartes outils */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {OUTILS_DEF.map(outil => {
            const stats = calcEfficienceOutil(sessions, outil.id);
            return (
              <div key={outil.id} style={{
                background: 'var(--carte-bg)',
                border: `1px solid var(--carte-border)`,
                borderTop: `4px solid ${outil.couleur}`,
                borderRadius: '14px',
                padding: '1.5rem',
                boxShadow: 'var(--ombre)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--ombre)'; }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{outil.icon}</div>
                <h3 style={{ margin: '0 0 0.35rem', color: 'var(--encre)' }}>{outil.titre}</h3>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.87rem', color: 'var(--encre-2)', lineHeight: 1.4 }}>{outil.desc}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--encre-3)', marginBottom: '0.75rem' }}>⏱ {outil.duree}</div>

                {/* Stats vraies ou "Pas encore essayé" */}
                <div style={{ marginBottom: '1rem' }}>
                  {stats ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--encre-3)', marginBottom: '0.3rem' }}>
                        <span>Ton efficacité ({stats.count} session{stats.count > 1 ? 's' : ''})</span>
                        <span style={{ fontWeight: 700, color: outil.couleur }}>{stats.efficacite}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-2)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: outil.couleur, width: `${Math.min(stats.efficacite, 100)}%`, borderRadius: '999px', transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--encre-3)', fontStyle: 'italic' }}>Pas encore utilisé</div>
                  )}
                </div>

                <Link to={outil.lien}>
                  <button style={{
                    width: '100%', padding: '0.8rem', border: 'none', borderRadius: '8px',
                    background: outil.couleur, color: '#111', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.92rem',
                  }}>
                    Commencer →
                  </button>
                </Link>

                {outil.lienPro && (
                  <Link to={outil.lienPro} style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--encre-3)', textDecoration: 'underline' }}>
                      🔊 Version voix Pro (bêta — nécessite clé Eleven Labs)
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Sessions récentes */}
        {sessionsRecentes.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Sessions récentes</h2>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {sessionsRecentes.map((s, i) => (
                <div key={i} style={{ background: 'var(--carte-bg)', border: '1px solid var(--carte-border)', borderRadius: '10px', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--encre)', fontSize: '0.95rem' }}>{s.nom}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--encre-3)', marginTop: '0.2rem' }}>
                      {new Date(s.date).toLocaleDateString('fr-FR')} · {s.duree} min
                    </div>
                  </div>
                  {s.efficacite > 0 && (
                    <div style={{ background: 'var(--accent-pale)', color: 'var(--accent-fonce)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem' }}>
                      {s.efficacite}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
