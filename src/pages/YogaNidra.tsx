import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';
import { getZenPlayer } from '../lib/zenMusic';
import SOSFlottant from '../lib/SOSFlottant';

type Duree = 'court' | 'moyen' | 'long';

const SCRIPTS: Record<Duree, { texte: string; pause: number }[]> = {
  court: [
    { texte: "Bienvenue dans cette session de Yoga Nidra.", pause: 1500 },
    { texte: "Installe-toi confortablement. Allonge-toi ou assieds-toi. Ferme les yeux doucement.", pause: 3000 },
    { texte: "Tu n'as rien à faire. Rien à contrôler. Juste être ici.", pause: 3000 },
    { texte: "Prends une grande inspiration... retiens un instant... et expire lentement, complètement.", pause: 4000 },
    { texte: "Encore une fois. Inspire profondément... et expire.", pause: 4000 },
    { texte: "Formule maintenant une intention simple, au présent. Peut-être : je suis en paix. Ou : je m'accueille avec douceur. Répète-la trois fois en silence.", pause: 8000 },
    { texte: "Nous allons voyager dans ton corps, partie par partie. Juste observer, sans forcer.", pause: 2500 },
    { texte: "Les doigts de la main droite... la paume... le poignet... l'avant-bras... le coude... l'épaule droite.", pause: 4000 },
    { texte: "L'épaule gauche... le bras gauche... les doigts de la main gauche.", pause: 3500 },
    { texte: "La poitrine... le cœur qui bat... l'abdomen qui monte et descend doucement.", pause: 4000 },
    { texte: "Les deux jambes... les pieds... les orteils.", pause: 3500 },
    { texte: "Le dos... les épaules... le cou... la mâchoire... les yeux... le front... le sommet de la tête.", pause: 4000 },
    { texte: "Tout ton corps. Un tout. En paix.", pause: 5000 },
    { texte: "Imagine maintenant un lieu de paix absolue. Un endroit où tu te sens totalement en sécurité.", pause: 3000 },
    { texte: "Vois les couleurs de ce lieu... Entends les sons... Sens l'air sur ta peau. Tu es ici. En sécurité.", pause: 10000 },
    { texte: "Il est maintenant temps de revenir doucement.", pause: 2000 },
    { texte: "Répète une dernière fois ton intention intérieure.", pause: 5000 },
    { texte: "Bouge doucement les doigts... les orteils... Étire-toi si tu en as envie.", pause: 4000 },
    { texte: "Prends une grande respiration... et ouvre les yeux lentement.", pause: 3000 },
    { texte: "Bienvenue. Tu reviens ici, portant cette paix avec toi. Namaste.", pause: 2000 },
  ],
  moyen: [
    { texte: "Bienvenue dans cette session de Yoga Nidra de trente minutes.", pause: 2000 },
    { texte: "Installe-toi confortablement. Si tu es allongée, laisse tes bras légèrement écartés du corps, paumes vers le ciel. Si tu es assise, pose tes mains sur tes genoux.", pause: 5000 },
    { texte: "Ferme les yeux. Tu n'as rien à faire d'autre qu'être ici.", pause: 4000 },
    { texte: "Prends trois grandes respirations. Inspire par le nez... et expire lentement par la bouche.", pause: 3000 },
    { texte: "Inspire profondément...", pause: 5000 },
    { texte: "Et expire, complètement.", pause: 5000 },
    { texte: "Une dernière fois. Inspire...", pause: 5000 },
    { texte: "Et expire. Laisse aller.", pause: 5000 },
    { texte: "Formule maintenant ton Sankalpa, ton intention profonde. Une phrase courte, positive, au présent. Quelque chose qui compte vraiment pour toi.", pause: 4000 },
    { texte: "Répète-la mentalement. Avec conviction. Trois fois.", pause: 10000 },
    { texte: "Nous allons maintenant faire le tour de ton corps. Amène simplement ton attention là où je guide. Sans effort.", pause: 3000 },
    { texte: "Le pouce droit... l'index droit... le majeur... l'annulaire... le petit doigt.", pause: 4000 },
    { texte: "La paume droite... le dos de la main... le poignet... l'avant-bras... le coude.", pause: 4000 },
    { texte: "Le haut du bras droit... l'épaule droite... l'aisselle droite.", pause: 3500 },
    { texte: "L'épaule gauche... le haut du bras gauche... le coude gauche... l'avant-bras gauche.", pause: 4000 },
    { texte: "Le poignet gauche... la paume gauche... les cinq doigts de la main gauche.", pause: 4000 },
    { texte: "Le côté droit de la poitrine... le côté gauche... le centre de la poitrine... le cœur.", pause: 4000 },
    { texte: "L'abdomen droit... l'abdomen gauche... le nombril... le ventre qui respire.", pause: 4000 },
    { texte: "Le bas du dos... le milieu du dos... les omoplates... le haut du dos.", pause: 4000 },
    { texte: "La cuisse droite... le genou droit... le mollet... la cheville... le talon... la plante du pied... les cinq orteils du pied droit.", pause: 5000 },
    { texte: "La cuisse gauche... le genou gauche... le mollet gauche... la cheville... le talon... la plante... les cinq orteils du pied gauche.", pause: 5000 },
    { texte: "Les deux pieds ensemble. Les deux jambes. Le bassin. Le ventre. La poitrine.", pause: 4000 },
    { texte: "Le dos entier. Les épaules. Les deux bras. Les mains.", pause: 4000 },
    { texte: "Le cou. La gorge. La mâchoire. Les lèvres.", pause: 3500 },
    { texte: "Le nez. Les joues. Les yeux fermés. Le front. Les tempes. Le sommet de la tête.", pause: 4000 },
    { texte: "Tout le corps. De la tête aux pieds. Un tout. Complet. En paix.", pause: 6000 },
    { texte: "Maintenant, les opposés. Je vais nommer deux sensations. Ressens chacune brièvement, sans t'y accrocher.", pause: 3000 },
    { texte: "Lourdeur... légèreté.", pause: 5000 },
    { texte: "Chaleur... fraîcheur.", pause: 5000 },
    { texte: "Joie... tristesse. Les deux font partie de toi. Accepte-les.", pause: 6000 },
    { texte: "Maintenant, une visualisation. Imagine-toi dans un jardin magnifique.", pause: 3000 },
    { texte: "Vois la lumière qui filtre entre les arbres. Les fleurs. Les couleurs.", pause: 5000 },
    { texte: "Entends les oiseaux. Le vent dans les feuilles. L'eau d'un ruisseau.", pause: 5000 },
    { texte: "Sens le parfum des fleurs. L'herbe fraîche sous tes pieds.", pause: 5000 },
    { texte: "Tu es ici. Totalement en sécurité. Totalement aimée.", pause: 8000 },
    { texte: "Répète une dernière fois ton intention. Laisse-la résonner en toi.", pause: 8000 },
    { texte: "Il est temps de revenir doucement. Commence à sentir ton corps.", pause: 3000 },
    { texte: "Bouge les doigts. Les orteils. Prends une grande inspiration.", pause: 5000 },
    { texte: "Étire-toi si tu en as envie. Roule sur le côté doucement.", pause: 4000 },
    { texte: "Ouvre les yeux quand tu es prête. Prends ton temps.", pause: 4000 },
    { texte: "Bienvenue. Tu reviens ici, entière, régénérée. Portant ta paix avec toi. Namaste.", pause: 2000 },
  ],
  long: [
    { texte: "Bienvenue dans cette session profonde de Yoga Nidra. Prends tout ton temps pour t'installer.", pause: 4000 },
    { texte: "Allonge-toi sur le dos, bras légèrement écartés, paumes vers le ciel. Jambes légèrement écartées. Corps entièrement soutenu.", pause: 6000 },
    { texte: "Si tu as froid, couvre-toi. Si tu as besoin de quelque chose, arrange-toi maintenant. Cette session est pour toi.", pause: 6000 },
    { texte: "Ferme les yeux. Reste éveillée. Le but du Yoga Nidra n'est pas de dormir, mais d'accéder à l'état entre le sommeil et l'éveil.", pause: 6000 },
    { texte: "Commence par relâcher tout effort. Laisse le sol te porter entièrement.", pause: 5000 },
    { texte: "Prends cinq respirations profondes et lentes. Inspire... expire.", pause: 5000 },
    { texte: "Inspire...", pause: 6000 },
    { texte: "Expire.", pause: 6000 },
    { texte: "Inspire...", pause: 6000 },
    { texte: "Expire.", pause: 6000 },
    { texte: "Inspire...", pause: 6000 },
    { texte: "Expire... et laisse ton souffle reprendre son rythme naturel.", pause: 5000 },
    { texte: "Formule maintenant ton Sankalpa. Cette intention vient du cœur. Elle est simple. Vraie. Au présent.", pause: 5000 },
    { texte: "Prends le temps de la formuler clairement. Puis répète-la mentalement. Avec toute ta conviction.", pause: 12000 },
    { texte: "Elle s'imprime maintenant dans les couches profondes de ton être.", pause: 5000 },
    { texte: "Nous allons maintenant faire un scan complet et lent du corps.", pause: 3000 },
    // ... scan très détaillé ...
    { texte: "La main droite. Les doigts un par un. Le pouce... l'index... le majeur... l'annulaire... l'auriculaire.", pause: 6000 },
    { texte: "La paume. Le dos de la main. Le poignet. L'avant-bras.", pause: 5000 },
    { texte: "Le pli du coude. Le coude. Le haut du bras. L'épaule droite.", pause: 5000 },
    { texte: "La main gauche. Les doigts. Le pouce... l'index... le majeur... l'annulaire... l'auriculaire.", pause: 6000 },
    { texte: "La paume. Le dos de la main. Le poignet. L'avant-bras gauche.", pause: 5000 },
    { texte: "Le coude gauche. Le haut du bras. L'épaule gauche.", pause: 5000 },
    { texte: "Les deux épaules ensemble. Le haut du dos. L'espace entre les omoplates.", pause: 5000 },
    { texte: "La colonne vertébrale. De la première vertèbre jusqu'au coccyx.", pause: 5000 },
    { texte: "La poitrine. Le sternum. Le côté droit. Le côté gauche. Le cœur.", pause: 5000 },
    { texte: "L'abdomen. Le nombril. Le plexus solaire. Le bas-ventre.", pause: 5000 },
    { texte: "La hanche droite. La fesse droite. La cuisse droite, devant et derrière.", pause: 5000 },
    { texte: "Le genou droit. Le tibia. Le mollet. La cheville droite.", pause: 5000 },
    { texte: "Le talon. La plante du pied droit. Le gros orteil... le deuxième... le troisième... le quatrième... le petit orteil.", pause: 6000 },
    { texte: "La hanche gauche. La fesse gauche. La cuisse gauche.", pause: 5000 },
    { texte: "Le genou gauche. Le mollet. La cheville gauche.", pause: 5000 },
    { texte: "Le talon gauche. La plante du pied gauche. Les cinq orteils du pied gauche.", pause: 6000 },
    { texte: "Le cou. La gorge. Le larynx. Les cordes vocales.", pause: 4000 },
    { texte: "Le menton. La mâchoire inférieure. Les dents. La langue. Le palais.", pause: 5000 },
    { texte: "Les lèvres. Le nez. Les narines. L'air frais qui entre.", pause: 4000 },
    { texte: "Les joues. Les os des pommettes. Les oreilles. Le lobe gauche. Le lobe droit.", pause: 5000 },
    { texte: "Les yeux fermés. Les paupières. Les sourcils. L'espace entre les sourcils.", pause: 5000 },
    { texte: "Le front. Les tempes. Les côtés de la tête. Le sommet.", pause: 5000 },
    { texte: "L'arrière de la tête. La base du crâne.", pause: 4000 },
    { texte: "Tout le corps. Présent. Vivant. En paix.", pause: 8000 },
    { texte: "Les opposés. Ressens brièvement chaque sensation.", pause: 3000 },
    { texte: "Lourd... léger.", pause: 6000 },
    { texte: "Chaud... froid.", pause: 6000 },
    { texte: "Douleur... plaisir.", pause: 6000 },
    { texte: "Peur... courage.", pause: 6000 },
    { texte: "Solitude... connexion.", pause: 6000 },
    { texte: "Ces opposés coexistent en toi. Tu es assez vaste pour les contenir tous.", pause: 6000 },
    { texte: "La visualisation. Laisse venir des images spontanément.", pause: 3000 },
    { texte: "Une fleur qui s'ouvre au soleil.", pause: 5000 },
    { texte: "Un lac immobile au lever du soleil.", pause: 5000 },
    { texte: "Une montagne enneigée sous un ciel étoilé.", pause: 5000 },
    { texte: "Un enfant qui rit, insouciant.", pause: 5000 },
    { texte: "Toi, heureuse. En paix. Telle que tu es.", pause: 8000 },
    { texte: "Maintenant visite ton lieu de sécurité. L'endroit le plus sûr du monde pour toi.", pause: 4000 },
    { texte: "Vois chaque détail. Ressens chaque texture. Entends chaque son. Sens chaque parfum.", pause: 10000 },
    { texte: "Tu peux toujours y revenir. Il est à toi.", pause: 6000 },
    { texte: "Répète ton Sankalpa une dernière fois. Avec toute ta conviction. Avec amour pour toi-même.", pause: 12000 },
    { texte: "Il est maintenant ancré en toi. Profondément.", pause: 5000 },
    { texte: "Commence à revenir doucement. Sens le poids de ton corps.", pause: 4000 },
    { texte: "Recommence à percevoir les sons autour de toi.", pause: 4000 },
    { texte: "Bouge doucement les doigts. Les orteils.", pause: 5000 },
    { texte: "Prends une grande inspiration. Remplis-toi d'air frais.", pause: 5000 },
    { texte: "Étire-toi complètement si tu en as envie. Bras au-dessus de la tête. Jambes allongées.", pause: 6000 },
    { texte: "Roule sur le côté droit. Reste là un moment.", pause: 6000 },
    { texte: "Lentement, prends appui pour t'asseoir.", pause: 5000 },
    { texte: "Ouvre les yeux quand tu es prête. Il n'y a pas de hâte.", pause: 5000 },
    { texte: "Tu reviens ici, entière, régénérée, portant en toi une paix profonde. Namaste.", pause: 3000 },
  ],
};

export default function YogaNidra() {
  const navigate = useNavigate();
  const [duree, setDuree] = useState<Duree | null>(null);
  const [phase, setPhase] = useState<'choix' | 'avant' | 'session' | 'apres'>('choix');
  const [avantScore, setAvantScore] = useState(5);
  const [apresScore, setApresScore] = useState(5);
  const [enCours, setEnCours] = useState(false);
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres, setProgres] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [tempsSession, setTempsSession] = useState(0);
  const [texteActuel, setTexteActuel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const options = {
    court: { label: '15 min', desc: 'Pause rapide et régénérante' },
    moyen: { label: '30 min', desc: 'Session complète et profonde' },
    long:  { label: '60 min', desc: 'Immersion thérapeutique totale' },
  };

  useEffect(() => {
    return () => {
      arreter();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const [volumeMusique, setVolumeMusique] = useState(0.4);
  const zenPlayer = getZenPlayer();

  const demarrer = () => {
    if (!duree) return;
    const script = SCRIPTS[duree];
    setTotalSegments(script.length);
    setProgres(0);
    setEnCours(true);
    setPhase('session');

    // Musique + voix depuis le geste utilisateur (fix iOS)
    zenPlayer.play(volumeMusique);
    jouerScriptGuidé(
      script,
      (index, _total, texte) => { setProgres(index); if (texte) setTexteActuel(texte); },
      () => {
        setEnCours(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        zenPlayer.stop();
        setPhase('apres');
      }
    );

    intervalRef.current = setInterval(() => {
      setTempsSession(t => t + 1);
    }, 1000);
  };

  const togglePause = () => {
    if (enPauseEtat) {
      reprendre();
      zenPlayer.play(volumeMusique);
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
    setEnCours(false);
    setPhase('apres');
  };

  const sauvegarder = () => {
    const session = {
      id: Date.now().toString(),
      type: 'yoga_nidra',
      nom: `Yoga Nidra ${options[duree!].label}`,
      duree: Math.round(tempsSession / 60),
      date: new Date().toISOString(),
      efficacite: Math.max(0, (apresScore - avantScore) * 15 + 50),
      avantApres: { avant: avantScore, apres: apresScore },
    };
    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);
    sessions.push(session);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(sessions));
    navigate('/outils-therapeutiques');
  };

  const formatTemps = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>

        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧘</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Yoga Nidra</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>
            Relaxation guidée profonde. La voix t'accompagne tout au long de la session — tu n'as rien à faire.
          </p>
        </div>

        {/* CHOIX DURÉE */}
        {phase === 'choix' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Choisis ta durée</h2>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(Object.entries(options) as [Duree, typeof options.court][]).map(([key, val]) => (
                <div key={key} onClick={() => setDuree(key)}
                  style={{
                    padding: '1.1rem 1.25rem',
                    border: `2px solid ${duree === key ? 'var(--accent)' : 'var(--carte-border)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: duree === key ? 'var(--accent-pale)' : 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s',
                  }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--encre)' }}>{val.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)' }}>{val.desc}</div>
                  </div>
                  {duree === key && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
            <button onClick={() => duree && setPhase('avant')} disabled={!duree}
              style={{
                width: '100%', padding: '1rem', borderRadius: '999px',
                background: duree ? 'var(--accent)' : 'var(--carte-border)',
                color: duree ? 'white' : 'var(--encre-3)',
                border: 'none', fontWeight: 700, fontSize: '1rem', cursor: duree ? 'pointer' : 'default',
              }}>
              Continuer →
            </button>
          </div>
        )}

        {/* AVANT */}
        {phase === 'avant' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Avant la session</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.25rem' }}>Comment tu te sens en ce moment ?</p>

            <input type="range" min={0} max={10} value={avantScore}
              onChange={e => setAvantScore(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Épuisée</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>{avantScore}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Pleine d'énergie</span>
            </div>

            <div style={{ background: 'var(--accent-pale)', padding: '1.1rem', borderRadius: '10px', marginBottom: '1rem', color: 'var(--accent-fonce)', fontSize: '0.9rem' }}>
              🎵 Musique zen générée + 🎙️ voix guidée démarrent automatiquement.
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--encre-2)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>🎵 Volume musique de fond</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{Math.round(volumeMusique * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={volumeMusique}
                onChange={e => setVolumeMusique(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setPhase('choix')}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 600, cursor: 'pointer', color: 'var(--encre-2)' }}>
                Retour
              </button>
              <button onClick={demarrer}
                style={{ flex: 2, padding: '0.9rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                🎙️ Commencer la guidance
              </button>
            </div>
          </div>
        )}

        {/* SESSION EN COURS */}
        {phase === 'session' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Yoga Nidra en cours</h2>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ferme les yeux et laisse-toi guider</p>

            {/* Animation */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'var(--accent)', margin: '0 auto 1.5rem',
              animation: enPauseEtat ? 'none' : 'pulse 4s ease-in-out infinite',
              opacity: enPauseEtat ? 0.4 : 1,
              transition: 'opacity 0.3s',
            }} />

            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>
              {formatTemps(tempsSession)}
            </div>

            {/* Barre de progression */}
            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 6, margin: '0 auto 1.5rem', maxWidth: 300 }}>
              <div style={{
                height: 6, borderRadius: '999px', background: 'var(--accent)',
                width: `${totalSegments > 0 ? (progres / totalSegments) * 100 : 0}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>

            <p style={{ color: 'var(--encre-2)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {enPauseEtat ? '⏸ En pause' : '🎵 Musique zen  ·  🎙️ Voix guidée'}
            </p>

            {/* Texte courant visible */}
            {texteActuel && !enPauseEtat && (
              <div style={{
                background: 'var(--accent-pale)',
                borderRadius: '10px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.25rem',
                color: 'var(--accent-fonce)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                「{texteActuel}」
              </div>
            )}

            <div style={{ maxWidth: 260, margin: '0 auto 1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--encre-3)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>🎵 Musique</span>
                <span>{Math.round(volumeMusique * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={volumeMusique}
                onChange={e => { setVolumeMusique(+e.target.value); zenPlayer.setVolume(+e.target.value); }}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
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

        {/* APRÈS */}
        {phase === 'apres' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Session terminée 🌿</h2>
            <p style={{ color: 'var(--encre-2)', marginBottom: '1.25rem' }}>Durée : {formatTemps(tempsSession)}</p>

            <p style={{ color: 'var(--encre-2)', marginBottom: '0.75rem' }}>Comment tu te sens maintenant ?</p>
            <input type="range" min={0} max={10} value={apresScore}
              onChange={e => setApresScore(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>0 — Épuisée</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>{apresScore}/10</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>10 — Pleine d'énergie</span>
            </div>

            {apresScore > avantScore && (
              <div style={{ background: 'var(--accent-pale)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: 'var(--accent-fonce)', fontWeight: 600 }}>
                ✓ +{apresScore - avantScore} points — belle progression !
              </div>
            )}

            <button onClick={sauvegarder}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
              Sauvegarder et terminer
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
      <SOSFlottant />
    </div>
  );
}
