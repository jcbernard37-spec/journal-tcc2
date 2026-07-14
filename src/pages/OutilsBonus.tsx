import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { getZenPlayer } from '../lib/zenMusic';

type Outil = 'tapping' | 'coherence' | 'meditation' | 'affirmations';

const TAPPING = [
  { texte: "Bienvenue dans cette session de tapping EFT. Pense à quelque chose qui te cause du stress en ce moment. Donne-lui un niveau de 0 à 10.", pause: 6000 },
  { texte: "Nous allons commencer par la phrase de setup. Tape le côté de ta main — la partie charnue sous le petit doigt — et répète avec moi :", pause: 3000 },
  { texte: "Même si je ressens ce stress, je m'accepte complètement et profondément.", pause: 4000 },
  { texte: "Encore. Même si je ressens ce stress, je m'accepte complètement et profondément.", pause: 4000 },
  { texte: "Une dernière fois. Même si je ressens ce stress, je m'accepte complètement et profondément.", pause: 4000 },
  { texte: "Maintenant, tape le sommet de ta tête. Sept à neuf petits tapotements doux. Ce stress que je ressens.", pause: 4000 },
  { texte: "Le début du sourcil, côté intérieur. Ce stress dans mon corps.", pause: 4000 },
  { texte: "Le côté de l'œil, sur l'os. Cette tension que je porte.", pause: 4000 },
  { texte: "Sous l'œil, sur la pommette. Je reconnais ce que je ressens.", pause: 4000 },
  { texte: "Sous le nez. Il est normal de ressentir ça.", pause: 4000 },
  { texte: "Le menton, dans le creux. J'accueille ces émotions.", pause: 4000 },
  { texte: "La clavicule. Je me donne la permission de lâcher.", pause: 4000 },
  { texte: "Sous l'aisselle, sur la côte. Je relâche ce stress maintenant.", pause: 4000 },
  { texte: "Retour au sommet de la tête. Je me sens de plus en plus calme.", pause: 4000 },
  { texte: "Le sourcil. Plus légère.", pause: 4000 },
  { texte: "Le côté de l'œil. Libérée.", pause: 4000 },
  { texte: "Sous l'œil. En sécurité.", pause: 4000 },
  { texte: "Sous le nez. En paix.", pause: 4000 },
  { texte: "Le menton. Je m'accepte.", pause: 4000 },
  { texte: "La clavicule. Je suis bien.", pause: 4000 },
  { texte: "Sous l'aisselle. Je lâche prise.", pause: 4000 },
  { texte: "Prends une grande inspiration. Expire complètement. Comment est ton niveau de stress maintenant, de 0 à 10 ? Il devrait avoir diminué.", pause: 6000 },
  { texte: "Tu peux répéter ce cycle autant de fois que nécessaire. Le tapping fonctionne — continue !", pause: 3000 },
];

const COHERENCE = [
  { texte: "Bienvenue dans la cohérence cardiaque. Cinq secondes d'inspiration, cinq secondes d'expiration, pendant cinq minutes.", pause: 3000 },
  { texte: "Assieds-toi droite, les deux pieds au sol. Détends tes épaules.", pause: 4000 },
  { texte: "Inspire lentement... un... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire lentement... un... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Très bien. Continue à ce rythme. Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Inspire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Expire... deux... trois... quatre... cinq.", pause: 6000 },
  { texte: "Excellente pratique. Cinq minutes de cohérence cardiaque régulent ton système nerveux pour les heures qui suivent. Prends une dernière grande inspiration, et reviens doucement.", pause: 4000 },
];

const MEDITATION = [
  { texte: "Méditation de bienveillance. Assieds-toi confortablement. Ferme les yeux.", pause: 3000 },
  { texte: "Commence par t'offrir à toi-même de la bienveillance. Place la main sur ton cœur.", pause: 4000 },
  { texte: "Répète mentalement : que je sois heureuse.", pause: 4000 },
  { texte: "Que je sois en bonne santé.", pause: 4000 },
  { texte: "Que je sois en sécurité.", pause: 4000 },
  { texte: "Que je vive dans la paix.", pause: 5000 },
  { texte: "Pense maintenant à quelqu'un que tu aimes. Un être cher.", pause: 4000 },
  { texte: "Envoie-lui : que tu sois heureuse ou heureux.", pause: 4000 },
  { texte: "Que tu sois en bonne santé.", pause: 4000 },
  { texte: "Que tu sois en sécurité.", pause: 4000 },
  { texte: "Que tu vives dans la paix.", pause: 5000 },
  { texte: "Étends maintenant cette bienveillance à toutes les personnes que tu connais.", pause: 4000 },
  { texte: "Que vous soyez heureuses.", pause: 4000 },
  { texte: "Que vous soyez en bonne santé.", pause: 4000 },
  { texte: "Que vous soyez en sécurité.", pause: 4000 },
  { texte: "Que vous viviez dans la paix.", pause: 5000 },
  { texte: "Étends maintenant cette bienveillance à tous les êtres vivants. Partout dans le monde.", pause: 4000 },
  { texte: "Que tous les êtres soient heureux. En bonne santé. En sécurité. En paix.", pause: 6000 },
  { texte: "Reviens à toi-même. Sens la chaleur dans ta poitrine.", pause: 4000 },
  { texte: "Ouvre les yeux doucement. Tu portes cette bienveillance avec toi.", pause: 3000 },
];

const AFFIRMATIONS = [
  { texte: "Session d'affirmations. Prends une grande inspiration.", pause: 4000 },
  { texte: "Ces affirmations sont des vérités que tu choisis de cultiver. Répète-les mentalement ou à voix haute.", pause: 4000 },
  { texte: "Je suis digne d'amour et de respect.", pause: 4000 },
  { texte: "Je fais de mon mieux, et c'est suffisant.", pause: 4000 },
  { texte: "Je mérite la paix et le bonheur.", pause: 4000 },
  { texte: "Je suis capable de traverser les épreuves.", pause: 4000 },
  { texte: "Je m'accepte telle que je suis, en ce moment.", pause: 4000 },
  { texte: "Je suis en sécurité.", pause: 4000 },
  { texte: "Mes émotions sont valides.", pause: 4000 },
  { texte: "Je grandis et j'apprends à chaque défi.", pause: 4000 },
  { texte: "Je mérite le repos.", pause: 4000 },
  { texte: "Je suis plus forte que mes peurs.", pause: 4000 },
  { texte: "Je me fais confiance.", pause: 4000 },
  { texte: "Je suis assez.", pause: 5000 },
  { texte: "Choisis maintenant l'affirmation qui t'a le plus touchée. Répète-la trois fois.", pause: 10000 },
  { texte: "Porte-la avec toi aujourd'hui.", pause: 3000 },
];

const OUTILS_CONFIG: Record<Outil, { titre: string; desc: string; icon: string; couleur: string; script: {texte: string; pause: number}[] }> = {
  tapping:      { titre: 'Tapping EFT',         desc: 'Libère le stress point par point', icon: '🫆', couleur: '#FF6B6B', script: TAPPING },
  coherence:    { titre: 'Cohérence Cardiaque',  desc: '5 min pour réguler le système nerveux', icon: '💓', couleur: '#4ECDC4', script: COHERENCE },
  meditation:   { titre: 'Méditation Bienveillance', desc: 'Metta — cultivar la compassion', icon: '🙏', couleur: '#9D84B7', script: MEDITATION },
  affirmations: { titre: 'Affirmations Guidées', desc: 'Renforce tes nouvelles croyances', icon: '✨', couleur: '#FFD93D', script: AFFIRMATIONS },
};

export default function OutilsBonus() {
  const navigate = useNavigate();
  const [outil, setOutil] = useState<Outil | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres, setProgres] = useState(0);
  const [total, setTotal] = useState(0);
  const [tempsSession, setTempsSession] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zenPlayer = getZenPlayer();
  // Outils avec musique de fond (méditation et affirmations)
  const AVEC_MUSIQUE: Outil[] = ['meditation', 'affirmations', 'coherence'];

  useEffect(() => () => { arreter(); zenPlayer.stop(); if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const demarrer = (o: Outil) => {
    setOutil(o);
    const cfg = OUTILS_CONFIG[o];
    setTotal(cfg.script.length);
    setPhase('session');
    intervalRef.current = setInterval(() => setTempsSession(t => t + 1), 1000);

    // Musique de fond pour méditation / affirmations / cohérence
    if (AVEC_MUSIQUE.includes(o)) {
      zenPlayer.play(0.35);
      setTimeout(() => {
        jouerScriptGuidé(cfg.script, (i) => setProgres(i), () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          zenPlayer.stop();
          setPhase('apres');
        });
      }, 3000);
    } else {
      jouerScriptGuidé(cfg.script, (i) => setProgres(i), () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('apres');
      });
    }
  };

  const togglePause = () => {
    if (enPauseEtat) {
      reprendre();
      if (outil && AVEC_MUSIQUE.includes(outil)) zenPlayer.play(0.35);
      setEnPauseEtat(false);
    } else {
      mettreEnPause();
      zenPlayer.stop();
      setEnPauseEtat(true);
    }
  };

  const sauvegarder = () => {
    const s = { id: Date.now().toString(), type: outil, nom: OUTILS_CONFIG[outil!].titre, duree: Math.round(tempsSession / 60), date: new Date().toISOString(), efficacite: 70 };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    zenPlayer.stop();
    setPhase('choix');
    setOutil(null);
    setTempsSession(0);
    setProgres(0);
  };

  const cfg = outil ? OUTILS_CONFIG[outil] : null;

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌟</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Outils Complémentaires</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>Tapping, cohérence cardiaque, méditation et affirmations — tous guidés par la voix.</p>
        </div>

        {phase === 'choix' && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(Object.entries(OUTILS_CONFIG) as [Outil, typeof OUTILS_CONFIG.tapping][]).map(([key, val]) => (
              <div key={key} onClick={() => demarrer(key)}
                style={{ background: 'var(--carte-bg)', border: '1px solid var(--carte-border)', borderRadius: '14px', padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'transform 0.15s', boxShadow: 'var(--ombre)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${val.couleur}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                  {val.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--encre)', marginBottom: '0.2rem' }}>{val.titre}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)' }}>{val.desc}</div>
                </div>
                <div style={{ color: val.couleur, fontWeight: 700, fontSize: '1.2rem' }}>▶</div>
              </div>
            ))}
          </div>
        )}

        {phase === 'session' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cfg.icon}</div>
            <h2 style={{ marginBottom: '0.5rem' }}>{cfg.titre}</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>Laisse-toi guider</p>

            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 8, margin: '0 auto 1rem', maxWidth: 300 }}>
              <div style={{ height: 8, borderRadius: '999px', background: cfg.couleur, width: `${total > 0 ? (progres / total) * 100 : 0}%`, transition: 'width 0.5s' }} />
            </div>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.88rem' }}>
              {enPauseEtat ? '⏸ En pause' : `🎙️ ${cfg.titre} en cours...`}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={togglePause} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: 'pointer', color: 'var(--encre)' }}>
                {enPauseEtat ? '▶ Reprendre' : '⏸ Pause'}
              </button>
              <button onClick={() => { arreter(); if (intervalRef.current) clearInterval(intervalRef.current); setPhase('apres'); }}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: 'pointer', color: 'var(--chaud)' }}>
                Terminer
              </button>
            </div>
          </div>
        )}

        {phase === 'apres' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Session terminée</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.5rem' }}>{cfg.titre} · {Math.round(tempsSession / 60)} min</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={sauvegarder} style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: cfg.couleur, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Sauvegarder
              </button>
              <button onClick={() => { setPhase('choix'); setOutil(null); setTempsSession(0); }}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 600, cursor: 'pointer', color: 'var(--encre-2)' }}>
                Autre outil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
