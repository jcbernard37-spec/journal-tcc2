import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jouerScriptGuidé, arreter, mettreEnPause, reprendre } from '../lib/voiceGuide';

type Niveau = 'relaxation' | 'croyance' | 'ressource';

const SCRIPTS: Record<Niveau, { texte: string; pause: number }[]> = {
  relaxation: [
    { texte: "Bienvenue dans cette induction hypnotique de relaxation.", pause: 2000 },
    { texte: "Installe-toi confortablement. Ferme les yeux.", pause: 3000 },
    { texte: "Commence par observer ta respiration. Ne la change pas. Juste l'observer.", pause: 4000 },
    { texte: "Inspire... et expire.", pause: 5000 },
    { texte: "Avec chaque expiration, tu te détends un peu plus.", pause: 4000 },
    { texte: "Imagine maintenant une lumière dorée et chaude qui entre par le sommet de ta tête.", pause: 4000 },
    { texte: "Cette lumière descend lentement... dans ton front... qui se détend.", pause: 4000 },
    { texte: "Dans tes yeux... qui se ferment plus profondément.", pause: 4000 },
    { texte: "Dans tes mâchoires... qui se relâchent.", pause: 4000 },
    { texte: "Dans ton cou... qui devient lourd et détendu.", pause: 4000 },
    { texte: "Dans tes épaules... qui descendent loin de tes oreilles.", pause: 4000 },
    { texte: "Dans tes bras... dans tes mains... jusqu'au bout des doigts.", pause: 4000 },
    { texte: "Dans ta poitrine... ton cœur bat calmement, régulièrement.", pause: 4000 },
    { texte: "Dans ton ventre... qui monte et descend doucement.", pause: 4000 },
    { texte: "Dans tes jambes... tes pieds... jusqu'aux orteils.", pause: 4000 },
    { texte: "Tu es maintenant complètement détendue. Dans un état de relaxation profonde.", pause: 5000 },
    { texte: "Imagine-toi au sommet d'un escalier confortable. Dix marches qui descendent vers un état de calme absolu.", pause: 4000 },
    { texte: "Dix... tu commences à descendre. Neuf... encore plus détendue.", pause: 4000 },
    { texte: "Huit... sept... tu descends doucement dans le calme.", pause: 4000 },
    { texte: "Six... cinq... à mi-chemin, totalement à l'aise.", pause: 4000 },
    { texte: "Quatre... trois... presque en bas.", pause: 4000 },
    { texte: "Deux... un... tu arrives au bas de l'escalier. Dans un espace de paix absolue.", pause: 6000 },
    { texte: "Ici, tu es en sécurité. Ici, rien ne peut te déranger.", pause: 5000 },
    { texte: "Reste dans cet espace quelques instants. Simplement être.", pause: 12000 },
    { texte: "Il est maintenant temps de remonter doucement. Je vais compter de un à cinq.", pause: 3000 },
    { texte: "Un... tu commences à revenir.", pause: 2000 },
    { texte: "Deux... tu sens ton corps.", pause: 2000 },
    { texte: "Trois... tes bras et tes jambes bougent légèrement.", pause: 2000 },
    { texte: "Quatre... tu prends une grande inspiration.", pause: 3000 },
    { texte: "Cinq. Ouvre les yeux. Tu es ici. Fraîche, détendue, sereine.", pause: 2000 },
  ],
  croyance: [
    { texte: "Bienvenue dans cette session pour transformer une croyance limitante.", pause: 2000 },
    { texte: "Ferme les yeux. Installe-toi. Prends trois grandes respirations.", pause: 3000 },
    { texte: "Inspire...", pause: 5000 },
    { texte: "Expire...", pause: 5000 },
    { texte: "Inspire...", pause: 5000 },
    { texte: "Expire...", pause: 5000 },
    { texte: "Inspire...", pause: 5000 },
    { texte: "Expire. Et laisse ton corps se détendre.", pause: 5000 },
    { texte: "Pense maintenant à cette croyance que tu portes. Quelque chose comme : je ne suis pas assez bien. Ou : je ne mérite pas. Ou : je suis trop ceci, pas assez cela.", pause: 5000 },
    { texte: "Remarque l'endroit dans ton corps où tu sens cette croyance. L'estomac ? La gorge ? La poitrine ?", pause: 6000 },
    { texte: "Maintenant, je voudrais que tu imagines cette croyance sous forme d'objet. N'importe quelle forme qui vient spontanément.", pause: 6000 },
    { texte: "Vois sa couleur. Sa taille. Sa texture. Observe-la sans la juger.", pause: 6000 },
    { texte: "Maintenant, tu vas remarquer quelque chose d'important. Cette croyance t'a peut-être protégée autrefois. Elle avait une utilité.", pause: 5000 },
    { texte: "Remercie-la. Dis-lui : merci de m'avoir protégée. Je n'ai plus besoin de toi de cette façon.", pause: 6000 },
    { texte: "Observe maintenant comment l'objet qui représentait cette croyance change. Peut-être qu'il devient plus petit. Ou qu'il change de couleur.", pause: 7000 },
    { texte: "Maintenant, imagine un espace vide là où était cette croyance. Un espace lumineux.", pause: 5000 },
    { texte: "Dans cet espace, tu peux planter une nouvelle graine. Une nouvelle vérité.", pause: 4000 },
    { texte: "Quelque chose comme : je fais de mon mieux et c'est suffisant. Ou : je mérite l'amour et le respect. Ou : j'ai les ressources pour traverser les épreuves.", pause: 6000 },
    { texte: "Répète cette nouvelle vérité lentement. Laisse-la résonner.", pause: 8000 },
    { texte: "Imagine cette nouvelle croyance comme une lumière qui grandit en toi. Qui illumine chaque cellule.", pause: 6000 },
    { texte: "Elle est là. Elle est vraie. Elle grandit.", pause: 6000 },
    { texte: "Je vais maintenant compter jusqu'à cinq. À cinq, tu seras complètement revenue, portant cette nouvelle vérité en toi.", pause: 3000 },
    { texte: "Un... deux... trois... tu sens ton corps. Quatre... tu prends une inspiration profonde. Cinq. Ouvre les yeux. Transformée.", pause: 3000 },
  ],
  ressource: [
    { texte: "Bienvenue dans cette session d'ancrage de ressource intérieure.", pause: 2000 },
    { texte: "Ferme les yeux. Détends-toi.", pause: 4000 },
    { texte: "Respire profondément. Trois fois.", pause: 12000 },
    { texte: "Aujourd'hui, nous allons accéder à une ressource qui est déjà en toi.", pause: 4000 },
    { texte: "Pense à un moment de ta vie où tu t'es sentie vraiment bien. Confiante. Compétente. En paix. Ou simplement heureuse.", pause: 5000 },
    { texte: "Ça peut être un moment simple. Quelque chose que tu as réussi. Un moment de connexion. Un instant de bonheur.", pause: 5000 },
    { texte: "Prends le temps de trouver ce souvenir.", pause: 8000 },
    { texte: "Maintenant, entre dans ce souvenir. Vois ce que tu voyais alors.", pause: 5000 },
    { texte: "Entends ce que tu entendais.", pause: 4000 },
    { texte: "Ressens ce que tu ressentais dans ton corps.", pause: 5000 },
    { texte: "Comment se sentait ta poitrine ? Tes épaules ? Ton visage ?", pause: 5000 },
    { texte: "Amplifie ces sensations. Rends-les plus intenses. Plus vivantes.", pause: 6000 },
    { texte: "Tu es dans cet état maintenant. Cet état de force, de confiance, de bien-être.", pause: 5000 },
    { texte: "Nous allons maintenant créer un ancrage. Un signal qui te permettra de retrouver cet état n'importe quand.", pause: 4000 },
    { texte: "Choisis un geste simple. Par exemple, presser le pouce et l'index ensemble. Ou poser la main sur le cœur. Ou inspirer profondément.", pause: 6000 },
    { texte: "Fais ce geste maintenant. Et ressens l'état de ressource.", pause: 5000 },
    { texte: "Encore une fois. Le geste... et l'état.", pause: 6000 },
    { texte: "Une dernière fois. Geste... et ressens la force, la confiance, le bien-être.", pause: 6000 },
    { texte: "L'ancrage est créé. Maintenant, quand tu auras besoin de cette ressource, fais simplement ce geste.", pause: 5000 },
    { texte: "Elle est là. Toujours disponible. En toi.", pause: 5000 },
    { texte: "Reviens maintenant. Un... deux... trois... quatre... cinq. Ouvre les yeux. Portant ta ressource avec toi.", pause: 3000 },
  ],
};

export default function Hypnose() {
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [phase, setPhase] = useState<'choix' | 'session' | 'apres'>('choix');
  const [ressenti, setRessenti] = useState(5);
  const [enPauseEtat, setEnPauseEtat] = useState(false);
  const [progres, setProgres] = useState(0);
  const [total, setTotal] = useState(0);
  const [tempsSession, setTempsSession] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const niveaux = {
    relaxation: { label: 'Relaxation profonde',    desc: 'Induction douce — idéal pour débuter',       duree: '~20 min', icon: '🌊' },
    croyance:   { label: 'Transformer une croyance', desc: 'Reprogramme un pattern limitant',           duree: '~25 min', icon: '🔑' },
    ressource:  { label: 'Ancrer une ressource',    desc: 'Accède à ta force intérieure à volonté',     duree: '~20 min', icon: '💎' },
  };

  useEffect(() => () => { arreter(); if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const demarrer = () => {
    if (!niveau) return;
    const script = SCRIPTS[niveau];
    setTotal(script.length);
    setPhase('session');
    intervalRef.current = setInterval(() => setTempsSession(t => t + 1), 1000);
    jouerScriptGuidé(script, (i) => setProgres(i), () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase('apres');
    });
  };

  const togglePause = () => {
    if (enPauseEtat) { reprendre(); setEnPauseEtat(false); }
    else { mettreEnPause(); setEnPauseEtat(true); }
  };

  const sauvegarder = () => {
    const s = { id: Date.now().toString(), type: 'hypnose', nom: niveaux[niveau!].label, duree: Math.round(tempsSession / 60), date: new Date().toISOString(), efficacite: ressenti * 10 };
    const arr = JSON.parse(localStorage.getItem('tcc_sessions_therapie') || '[]');
    arr.push(s);
    localStorage.setItem('tcc_sessions_therapie', JSON.stringify(arr));
    navigate('/outils-therapeutiques');
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => { arreter(); navigate('/outils-therapeutiques'); }}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌀</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Hypnose Ericksonienne</h1>
          <p style={{ color: 'var(--encre-2)', margin: 0 }}>Induction guidée par la voix. Laisse-toi porter.</p>
        </div>

        {phase === 'choix' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Choisis ta session</h2>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(Object.entries(niveaux) as [Niveau, typeof niveaux.relaxation][]).map(([key, val]) => (
                <div key={key} onClick={() => setNiveau(key)}
                  style={{ padding: '1.1rem 1.25rem', border: `2px solid ${niveau === key ? '#9D84B7' : 'var(--carte-border)'}`, borderRadius: '12px', cursor: 'pointer', background: niveau === key ? 'rgba(157,132,183,0.1)' : 'transparent', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>{val.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--encre)' }}>{val.label}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--encre-3)' }}>{val.desc} · {val.duree}</div>
                    </div>
                    {niveau === key && <span style={{ marginLeft: 'auto', color: '#9D84B7', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(157,132,183,0.1)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: '#7A5FA0', fontSize: '0.88rem' }}>
              🎙️ Mets le volume à un niveau confortable. La voix guidée démarre automatiquement.
            </div>
            <button onClick={() => niveau && demarrer()} disabled={!niveau}
              style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: niveau ? '#9D84B7' : 'var(--carte-border)', color: niveau ? 'white' : 'var(--encre-3)', border: 'none', fontWeight: 700, cursor: niveau ? 'pointer' : 'default' }}>
              🎙️ Commencer l'induction
            </button>
          </div>
        )}

        {phase === 'session' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem' }}>Induction en cours</h2>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #9D84B7', margin: '0 auto 1.5rem', animation: enPauseEtat ? 'none' : 'spin 8s linear infinite', opacity: enPauseEtat ? 0.4 : 1 }} />
            <div style={{ background: 'var(--bg-2)', borderRadius: '999px', height: 6, margin: '0 auto 1.5rem', maxWidth: 280 }}>
              <div style={{ height: 6, borderRadius: '999px', background: '#9D84B7', width: `${total > 0 ? (progres / total) * 100 : 0}%`, transition: 'width 0.5s' }} />
            </div>
            <p style={{ color: 'var(--encre-3)', marginBottom: '2rem', fontSize: '0.9rem' }}>{enPauseEtat ? '⏸ En pause' : '🎙️ Guidance vocale en cours...'}</p>
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

        {phase === 'apres' && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--carte-border)' }}>
            <h2 style={{ marginBottom: '1.25rem' }}>Comment tu te sens ? 🌀</h2>
            <input type="range" min={0} max={10} value={ressenti} onChange={e => setRessenti(+e.target.value)} style={{ width: '100%', accentColor: '#9D84B7', marginBottom: '0.5rem' }} />
            <div style={{ textAlign: 'center', fontWeight: 700, color: '#9D84B7', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{ressenti}/10</div>
            <button onClick={sauvegarder} style={{ width: '100%', padding: '1rem', borderRadius: '999px', background: '#9D84B7', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Sauvegarder
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
