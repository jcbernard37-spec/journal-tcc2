import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { getZenPlayer } from '../lib/zenMusic';
import SOSFlottant from '../lib/SOSFlottant';

type VisuType = 'abondance' | 'guerison' | 'enfant' | 'ressources' | 'safe' | 'dialogue';

const SCRIPTS: Record<VisuType, { texte: string; pause: number }[]> = {
  abondance: [
    { texte: "Bienvenue dans cette visualisation d'abondance et de manifestation.", pause: 2000 },
    { texte: "Installe-toi. Ferme les yeux. Laisse la musique t'envelopper.", pause: 5000 },
    { texte: "Prends trois grandes respirations. Inspire... et expire.", pause: 7000 },
    { texte: "Imagine maintenant ta vie telle qu'elle sera quand tout ce que tu désires sera réalisé.", pause: 5000 },
    { texte: "Non pas dans l'avenir. Maintenant. C'est déjà là.", pause: 5000 },
    { texte: "Où es-tu ? Dans quelle pièce, quel endroit ?", pause: 5000 },
    { texte: "Vois les couleurs autour de toi. La lumière. Les textures.", pause: 6000 },
    { texte: "Qu'est-ce que tu fais dans cette vie épanouie ? Avec qui es-tu ?", pause: 7000 },
    { texte: "Ressens la sécurité dans ta poitrine. Ce sentiment de plénitude.", pause: 6000 },
    { texte: "Tu as ce qu'il faut. Tu es ce qu'il faut. Maintenant.", pause: 6000 },
    { texte: "Pense à quelque chose que tu veux attirer dans ta vie.", pause: 5000 },
    { texte: "Visualise-le avec tous tes sens. Tu le touches. Tu l'entends. Tu le ressens.", pause: 7000 },
    { texte: "Maintenant, place ta main sur ton cœur.", pause: 4000 },
    { texte: "Dis intérieurement : je mérite cela. Je l'accueille dans ma vie.", pause: 6000 },
    { texte: "Ressens la gratitude comme si c'était déjà arrivé.", pause: 7000 },
    { texte: "La gratitude est le signal que l'univers comprend le mieux.", pause: 5000 },
    { texte: "Merci. Merci pour tout ce que j'ai. Merci pour ce qui vient.", pause: 7000 },
    { texte: "Reste dans cette vibration de gratitude et d'abondance.", pause: 10000 },
    { texte: "Maintenant, reviens doucement. Bouge les doigts.", pause: 4000 },
    { texte: "Ouvre les yeux quand tu es prête. Tu portes cette abondance avec toi.", pause: 3000 },
  ],
  guerison: [
    { texte: "Bienvenue dans cette session de guérison émotionnelle.", pause: 2000 },
    { texte: "Installe-toi confortablement. Ferme les yeux.", pause: 4000 },
    { texte: "Respire profondément. Trois fois. Laisse chaque expiration emporter une tension.", pause: 10000 },
    { texte: "Aujourd'hui, tu vas rencontrer une douleur. Non pour souffrir, mais pour la libérer.", pause: 5000 },
    { texte: "Pense à quelque chose qui te fait encore mal. Une personne, une situation, un souvenir.", pause: 7000 },
    { texte: "Ne force rien. Laisse venir ce qui vient spontanément.", pause: 5000 },
    { texte: "Observe cette douleur comme si tu la regardais de loin. Sans te perdre dedans.", pause: 6000 },
    { texte: "De quelle couleur est-elle ? Quelle forme a-t-elle ? Où la sens-tu dans ton corps ?", pause: 8000 },
    { texte: "Maintenant, parle-lui. Dis-lui : je te vois. Je reconnais que tu es là.", pause: 7000 },
    { texte: "Cette douleur a essayé de te protéger. Elle avait une raison d'être.", pause: 6000 },
    { texte: "Remercie-la pour ça.", pause: 6000 },
    { texte: "Et maintenant, tu peux lui dire : je n'ai plus besoin de toi de cette façon.", pause: 6000 },
    { texte: "Je te libère avec amour.", pause: 7000 },
    { texte: "Imagine que cette douleur se transforme. Elle change de couleur. Elle devient plus légère.", pause: 7000 },
    { texte: "Elle s'élève. Elle part. Tu la regardes partir sans la retenir.", pause: 8000 },
    { texte: "Dans l'espace qu'elle laisse, entre une lumière douce.", pause: 5000 },
    { texte: "Cette lumière est la guérison. Elle remplit chaque cellule de ton être.", pause: 7000 },
    { texte: "Tu es plus légère maintenant. Plus libre.", pause: 6000 },
    { texte: "Tu n'as pas oublié. Mais tu n'es plus prisonnière.", pause: 7000 },
    { texte: "Reste dans cette légèreté quelques instants.", pause: 10000 },
    { texte: "Prends une grande respiration. Reviens doucement. Tu es guérie.", pause: 4000 },
  ],
  enfant: [
    { texte: "Bienvenue dans cette rencontre avec ton enfant intérieur.", pause: 2000 },
    { texte: "Ferme les yeux. Laisse ton corps se détendre complètement.", pause: 5000 },
    { texte: "Respire. Trois fois, profondément.", pause: 10000 },
    { texte: "Imagine maintenant un chemin. Un chemin doux, dans un endroit que tu trouves beau.", pause: 5000 },
    { texte: "Tu marches sur ce chemin. Tu te sens en sécurité.", pause: 5000 },
    { texte: "Au bout du chemin, il y a une porte. Elle est petite, colorée, accueillante.", pause: 5000 },
    { texte: "Tu t'approches. Tu sais que de l'autre côté t'attend une partie de toi.", pause: 5000 },
    { texte: "Tu ouvres la porte doucement.", pause: 4000 },
    { texte: "Et tu la vois. Ou tu le vois. Ton enfant intérieur.", pause: 5000 },
    { texte: "Observe-le. Quel âge a-t-il ? Comment est-il habillé ? Quelle expression sur son visage ?", pause: 8000 },
    { texte: "Il t'attendait. Peut-être depuis longtemps.", pause: 5000 },
    { texte: "Tu t'approches doucement. Tu t'accroupis à sa hauteur.", pause: 5000 },
    { texte: "Et tu lui dis : je suis là. Je suis venue te retrouver.", pause: 6000 },
    { texte: "Je sais que tu as eu peur. Je sais que tu as souffert.", pause: 5000 },
    { texte: "Mais maintenant, tu n'es plus seul ou seule.", pause: 5000 },
    { texte: "Tu lui tends les bras. Il s'approche. Tu le prends dans tes bras.", pause: 7000 },
    { texte: "Ressens sa chaleur. Sa confiance en toi.", pause: 6000 },
    { texte: "Tu lui murmures tout ce qu'il avait besoin d'entendre.", pause: 5000 },
    { texte: "Tu es assez. Tu es digne. Tu es aimé ou aimée.", pause: 5000 },
    { texte: "Je suis là pour te protéger maintenant. Tu peux me faire confiance.", pause: 7000 },
    { texte: "Il sourit. Il est soulagé. Cette partie de toi se détend enfin.", pause: 7000 },
    { texte: "Vous restez ensemble un moment. Simplement.", pause: 12000 },
    { texte: "Maintenant, invite-le à devenir une partie de toi. À s'intégrer à qui tu es.", pause: 6000 },
    { texte: "Il accepte. Et il disparaît doucement dans ton cœur.", pause: 6000 },
    { texte: "Il est là. En toi. Pour toujours.", pause: 6000 },
    { texte: "Prends une grande inspiration. Reviens lentement. Plus entière qu'avant.", pause: 4000 },
  ],
  ressources: [
    { texte: "Bienvenue dans cette visualisation de tes ressources et de ton futur.", pause: 2000 },
    { texte: "Ferme les yeux. Respire.", pause: 5000 },
    { texte: "Pense à un défi que tu traverses en ce moment.", pause: 6000 },
    { texte: "Maintenant, projette-toi dans six mois. Tu l'as traversé.", pause: 5000 },
    { texte: "Comment te sens-tu ? Où es-tu ? Qu'est-ce qui a changé ?", pause: 7000 },
    { texte: "Ressens la fierté d'avoir tenu. La force que ça t'a donnée.", pause: 6000 },
    { texte: "Maintenant, pense à quelqu'un que tu admires. Quelqu'un de fort, de courageux.", pause: 6000 },
    { texte: "Qu'est-ce qui te plaît en lui ou en elle ? Quelles qualités vois-tu ?", pause: 7000 },
    { texte: "Ces qualités que tu admires... tu les portes aussi. Quelque part en toi.", pause: 6000 },
    { texte: "Rappelle-toi un moment où tu étais vraiment forte. Vraiment capable.", pause: 7000 },
    { texte: "Reviens dans ce moment. Vois ce que tu voyais. Ressens ce que tu ressentais.", pause: 8000 },
    { texte: "Cette force est toujours en toi. Elle ne part jamais.", pause: 6000 },
    { texte: "Tu peux y accéder à tout moment. Elle t'appartient.", pause: 6000 },
    { texte: "Maintenant, visualise ton succès. Ton objectif accompli. En détail.", pause: 8000 },
    { texte: "Utilise tous tes sens. Que vois-tu ? Qu'entends-tu ? Que ressens-tu ?", pause: 8000 },
    { texte: "Tu mérites ce succès. Tu as les ressources pour y arriver.", pause: 6000 },
    { texte: "Reviens doucement. Portant cette certitude avec toi.", pause: 4000 },
  ],
  safe: [
    { texte: "Bienvenue dans cette session de création de ton lieu de sécurité.", pause: 2000 },
    { texte: "Ferme les yeux. Prends le temps de t'installer.", pause: 5000 },
    { texte: "Respire profondément.", pause: 6000 },
    { texte: "Imagine maintenant un lieu. Ton lieu de sécurité absolue.", pause: 5000 },
    { texte: "Un endroit où rien ne peut te faire de mal. Réel ou imaginaire.", pause: 5000 },
    { texte: "Peut-être une plage au coucher de soleil. Une forêt silencieuse. Une chambre douillette.", pause: 6000 },
    { texte: "Laisse venir ce qui vient naturellement. Fais confiance à ton imagination.", pause: 5000 },
    { texte: "Tu y es. Regarde autour de toi. Que vois-tu ?", pause: 7000 },
    { texte: "Quelles couleurs ? Quelle lumière ? Quelle heure du jour ?", pause: 7000 },
    { texte: "Maintenant, écoute. Quels sons entends-tu dans ce lieu ?", pause: 7000 },
    { texte: "Sens l'air sur ta peau. La température. Le sol sous tes pieds.", pause: 7000 },
    { texte: "Tu es complètement en sécurité ici. Totalement protégée.", pause: 6000 },
    { texte: "Prends le temps d'explorer. Marche, touche, sens.", pause: 10000 },
    { texte: "Grave chaque détail dans ta mémoire. Tu pourras revenir ici à volonté.", pause: 6000 },
    { texte: "Ce lieu t'appartient. Il est toujours disponible pour toi.", pause: 6000 },
    { texte: "Pour y revenir : ferme les yeux, respire profondément, et tu es ici.", pause: 6000 },
    { texte: "Reviens doucement. Portant cette sécurité en toi.", pause: 4000 },
  ],
  dialogue: [
    { texte: "Bienvenue dans cette session de dialogue intérieur transformateur.", pause: 2000 },
    { texte: "Installe-toi confortablement. Ferme les yeux.", pause: 5000 },
    { texte: "Respire. Laisse ton corps se détendre.", pause: 7000 },
    { texte: "En toi, il y a de nombreuses parties. Chacune a une voix. Chacune a un rôle.", pause: 6000 },
    { texte: "Aujourd'hui, tu vas dialoguer avec l'une d'elles.", pause: 5000 },
    { texte: "Pense à une émotion ou un comportement qui te pose problème.", pause: 6000 },
    { texte: "La peur. La colère. La procrastination. Le perfectionnisme. Quelque chose qui te freine.", pause: 7000 },
    { texte: "Maintenant, imagine que cette partie de toi prend une forme. Un personnage, une couleur, une sensation.", pause: 7000 },
    { texte: "Observe-la. Sans la juger. Elle existe pour une raison.", pause: 6000 },
    { texte: "Tu lui demandes : quel est ton rôle ? Que cherches-tu à faire pour moi ?", pause: 8000 },
    { texte: "Écoute la réponse, même si elle te surprend.", pause: 8000 },
    { texte: "Tu lui demandes : depuis quand es-tu là ? Qu'est-ce qui t'a fait naître ?", pause: 8000 },
    { texte: "Écoute encore. Avec curiosité et compassion.", pause: 8000 },
    { texte: "Tu lui dis : je comprends. Tu as essayé de me protéger. Merci.", pause: 7000 },
    { texte: "Tu lui demandes : qu'est-ce dont tu aurais besoin pour te sentir moins seule, moins obligée de réagir si fort ?", pause: 9000 },
    { texte: "Laisse venir la réponse. Elle peut être inattendue.", pause: 8000 },
    { texte: "Tu t'engages à lui offrir ce dont elle a besoin. À une autre façon de vivre ensemble.", pause: 7000 },
    { texte: "Comment se sent cette partie de toi maintenant ?", pause: 7000 },
    { texte: "Observe le changement. Même minime. Quelque chose s'est déplacé.", pause: 7000 },
    { texte: "Remercie-la. Elle a fait de son mieux avec ce qu'elle avait.", pause: 6000 },
    { texte: "Prends une grande inspiration. Reviens doucement. Transformée.", pause: 5000 },
  ],
};

const CONFIG: Record<VisuType, { titre: string; desc: string; duree: string; icon: string; couleur: string }> = {
  abondance: { titre: 'Abondance & Manifestation', desc: 'Visualise et attire ce que tu veux', duree: '30 min', icon: '🌟', couleur: '#FFD93D' },
  guerison:  { titre: 'Guérison Émotionnelle',     desc: 'Pardonne et libère les blessures',  duree: '40 min', icon: '💛', couleur: '#FF9F43' },
  enfant:    { titre: 'Enfant Intérieur',           desc: 'Rencontre et soigne ta version enfant', duree: '45 min', icon: '🌱', couleur: '#6BCF7F' },
  ressources:{ titre: 'Ressources Futures',         desc: 'Visualise ta force et ton succès', duree: '25 min', icon: '🚀', couleur: '#4ECDC4' },
  safe:      { titre: 'Safe Place',                 desc: 'Crée ton sanctuaire intérieur',    duree: '20 min', icon: '🏝️', couleur: '#45B7D1' },
  dialogue:  { titre: 'Dialogue Transformateur',    desc: 'Parle à tes parties intérieures', duree: '50 min', icon: '🌀', couleur: '#9D84B7' },
};

export default function Visualisations() {
  const navigate = useNavigate();
  const [type,        setType]        = useState<VisuType | null>(null);
  const [phase,       setPhase]       = useState<'choix' | 'session' | 'apres'>('choix');
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres,     setProgres]     = useState(0);
  const [total,       setTotal]       = useState(0);
  const [tempsMin,    setTempsMin]    = useState(0);
  const [ressenti,    setRessenti]    = useState(7);
  const [volMusique,  setVolMusique]  = useState(0.35);
  const [texteActuel, setTexteActuel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const zenPlayer   = getZenPlayer();

  useEffect(() => () => {
    arreter();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // ── Démarre la session — DOIT être appelé directement depuis onClick ──
  const demarrer = (t: VisuType) => {
    setType(t);
    setPhase('session');
    setProgres(0);

    const script = SCRIPTS[t];
    setTotal(script.length);

    // 1. Musique zen (AudioContext depuis geste utilisateur ✓)
    zenPlayer.play(volMusique);

    // 2. Voix immédiatement — PAS de setTimeout (fix iOS critique)
    jouerScriptGuidé(
      script,
      (i, _t, txt) => { setProgres(i); if (txt) setTexteActuel(txt); },
      () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        zenPlayer.stop();
        setPhase('apres');
      }
    );

    // Timer
    intervalRef.current = setInterval(() => setTempsMin(m => m + 1), 60000);
  };

  const togglePause = () => {
    if (enPauseEtat) {
      reprendre();
      zenPlayer.play(volMusique);
      setEnPauseEtat(false);
    } else {
      mettreEnPause();
      zenPlayer.stop();
      setEnPauseEtat(true);
    }
  };

  const terminer = () => {
    arreter();
    zenPlayer.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('apres');
  };

  const sauvegarder = () => {
    const s = {
      id: Date.now().toString(), type: 'visualisation',
      nom: type ? CONFIG[type].titre : '',
      duree: tempsMin, date: new Date().toISOString(),
      efficacite: ressenti * 10,
    };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    navigate('/outils-therapeutiques');
  };

  const cfg = type ? CONFIG[type] : null;

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>

        <button onClick={() => { arreter(); zenPlayer.stop(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌈</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Visualisations Créatrices</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>
            6 voyages guidés. Voix + musique zen inclus. Ferme les yeux et laisse-toi porter.
          </p>
        </div>

        {/* ── CHOIX ── */}
        {phase === 'choix' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Choisis ta visualisation</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(Object.entries(CONFIG) as [VisuType, typeof CONFIG.abondance][]).map(([key, val]) => (
                <div key={key} onClick={() => setType(key)}
                  style={{
                    padding: '1.25rem 1rem',
                    border: `2px solid ${type === key ? val.couleur : 'var(--carte-border)'}`,
                    borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                    background: type === key ? `${val.couleur}18` : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{val.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--encre)', marginBottom: '0.3rem' }}>{val.titre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--encre-3)' }}>{val.duree}</div>
                </div>
              ))}
            </div>

            {type && (
              <div style={{ background: `${CONFIG[type].couleur}18`, padding: '0.9rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--encre-2)' }}>
                🎙️ <strong>{CONFIG[type].titre}</strong> — {CONFIG[type].desc}
                <br />Musique zen + voix guidée démarrent automatiquement dès que tu cliques.
              </div>
            )}

            <button onClick={() => type && demarrer(type)} disabled={!type}
              style={{
                width: '100%', padding: '1.1rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 700, border: 'none',
                background: type ? (CONFIG[type]?.couleur || 'var(--accent)') : 'var(--carte-border)',
                color: type ? '#111' : 'var(--encre-3)',
                cursor: type ? 'pointer' : 'default',
              }}>
              🎙️ Commencer la visualisation
            </button>
          </div>
        )}

        {/* ── SESSION ── */}
        {phase === 'session' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cfg.icon}</div>
            <h2 style={{ marginBottom: '0.3rem' }}>{cfg.titre}</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>Ferme les yeux · Laisse-toi guider</p>

            {/* Animation */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.couleur}, ${cfg.couleur}99)`,
              margin: '0 auto 1.5rem',
              animation: enPauseEtat ? 'none' : 'pulse 4s ease-in-out infinite',
              opacity: enPauseEtat ? 0.4 : 1,
            }} />

            {/* Barre progression */}
            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 6, maxWidth: 280, margin: '0 auto 0.75rem' }}>
              <div style={{ height: 6, borderRadius: '999px', background: cfg.couleur, width: `${total > 0 ? (progres / total) * 100 : 0}%`, transition: 'width 0.5s' }} />
            </div>

            <p style={{ color: 'var(--encre-3)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              {enPauseEtat ? '⏸ En pause' : '🎵 Musique zen  ·  🎙️ Voix guidée'}
            </p>

            {/* Texte live */}
            {texteActuel && !enPauseEtat && (
              <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', fontStyle: 'italic', textAlign: 'center', color: 'var(--encre-2)', lineHeight: 1.5 }}>
                「{texteActuel}」
              </div>
            )}

            {/* Volume musique */}
            <div style={{ maxWidth: 240, margin: '0 auto 1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--encre-3)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>🎵 Musique</span>
                <span>{Math.round(volMusique * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={volMusique}
                onChange={e => { setVolMusique(+e.target.value); zenPlayer.setVolume(+e.target.value); }}
                style={{ width: '100%', accentColor: cfg.couleur }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={togglePause}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 700, cursor: 'pointer', color: 'var(--encre)' }}>
                {enPauseEtat ? '▶ Reprendre' : '⏸ Pause'}
              </button>
              <button onClick={terminer}
                style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'var(--chaud-pale)', border: '1.5px solid var(--chaud)', fontWeight: 600, cursor: 'pointer', color: 'var(--chaud)' }}>
                Terminer
              </button>
            </div>
          </div>
        )}

        {/* ── APRÈS ── */}
        {phase === 'apres' && cfg && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Visualisation terminée ✨</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>{cfg.titre}</p>

            <p style={{ color: 'var(--encre-2)', marginBottom: '0.75rem' }}>Qu'as-tu ressenti ? (0–10)</p>
            <input type="range" min={0} max={10} value={ressenti}
              onChange={e => setRessenti(+e.target.value)}
              style={{ width: '100%', accentColor: cfg.couleur, marginBottom: '0.5rem' }} />
            <div style={{ textAlign: 'center', fontWeight: 700, color: cfg.couleur, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {ressenti}/10
            </div>

            <button onClick={sauvegarder}
              style={{ width: '100%', padding: '1.1rem', borderRadius: '999px', background: cfg.couleur, color: '#111', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Sauvegarder
            </button>
          </div>
        )}
      </div>

      <SOSFlottant />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
