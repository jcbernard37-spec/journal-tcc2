import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listerBibliotheque,
  chargerAudioBibliotheque,
  supprimerDeBibliotheque,
  SeanceBibliotheque,
} from '../lib/bibliotheque';
import { stockage } from '../lib/storage';
import SOSFlottant from '../lib/SOSFlottant';

const NOMS_OUTILS: Record<string, { titre: string; icon: string; couleur: string }> = {
  yoga_nidra_pro:  { titre: 'Yoga Nidra',              icon: '🧘', couleur: '#4ECDC4' },
  hypnose_pro:     { titre: 'Hypnose',                 icon: '🌙', couleur: '#9D84B7' },
  emdr_pro:        { titre: 'EMDR (introduction)',     icon: '👁️', couleur: '#FF6B6B' },
  visualization_pro:{ titre: 'Visualisation',           icon: '✨', couleur: '#FFD93D' },
  tapping:         { titre: 'Tapping EFT',             icon: '🫆', couleur: '#FF6B6B' },
  coherence:       { titre: 'Cohérence Cardiaque',     icon: '💓', couleur: '#4ECDC4' },
  meditation:      { titre: 'Méditation Bienveillance',icon: '🙏', couleur: '#9D84B7' },
  affirmations:    { titre: 'Affirmations Guidées',    icon: '✨', couleur: '#FFD93D' },
};

export default function Bibliotheque() {
  const navigate = useNavigate();
  const [seances, setSeances] = useState<SeanceBibliotheque[]>([]);
  const [chargement, setChargement] = useState(true);
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [audioEnCours, setAudioEnCours] = useState(false);
  const [enBoucle, setEnBoucle] = useState(false);
  const [telechargementId, setTelechargementId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    listerBibliotheque().then(s => { setSeances(s); setChargement(false); });
    return () => { audioPlayerRef.current?.pause(); };
  }, []);

  // Applique le mode boucle en direct, même sur une lecture déjà en cours
  useEffect(() => {
    if (audioPlayerRef.current) audioPlayerRef.current.loop = enBoucle;
  }, [enBoucle]);

  const lancer = async (seance: SeanceBibliotheque) => {
    audioPlayerRef.current?.pause();

    if (lectureId === seance.id) {
      // Toggle pause/reprendre sur la séance déjà chargée
      if (audioEnCours) {
        audioPlayerRef.current?.pause();
        setAudioEnCours(false);
      } else {
        audioPlayerRef.current?.play().catch(() => {});
        setAudioEnCours(true);
      }
      return;
    }

    // Si la séance vient d'un autre appareil, l'audio doit d'abord être
    // téléchargé depuis Drive — ça peut prendre un instant (fichier de
    // plusieurs Mo), d'où cet indicateur.
    setTelechargementId(seance.id);
    const url = await chargerAudioBibliotheque(seance.id);
    setTelechargementId(null);
    if (!url) return;

    const audio = new Audio(url);
    audio.loop = enBoucle;
    audioPlayerRef.current = audio;
    audio.onended = () => setAudioEnCours(false);
    audio.play().catch(err => console.error('Erreur lecture:', err));
    setLectureId(seance.id);
    setAudioEnCours(true);
  };

  const terminerEtSauvegarder = (seance: SeanceBibliotheque) => {
    audioPlayerRef.current?.pause();
    setAudioEnCours(false);
    setLectureId(null);
    stockage.ajouterEntree(seance.outil, {
      nom: seance.titre,
      duree_minutes: seance.dureeMinutes,
      efficacite: 70,
      depuis_bibliotheque: true,
    });
  };

  const supprimer = async (id: string) => {
    if (lectureId === id) {
      audioPlayerRef.current?.pause();
      setAudioEnCours(false);
      setLectureId(null);
    }
    await supprimerDeBibliotheque(id);
    setSeances(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="page">
      <div className="conteneur-etroit" style={{ paddingTop: '2rem' }}>
        <button onClick={() => navigate('/outils-therapeutiques')}
          style={{ background: 'none', border: 'none', color: 'var(--encre-3)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ← Retour aux outils
        </button>

        <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--carte-border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Ma bibliothèque</h1>
          <p style={{ color: 'var(--encre-2)', margin: '0 0 1rem' }}>
            Chaque séance générée est automatiquement gardée ici. Relance-la instantanément
            — sans attendre une nouvelle génération, et sans consommer de crédit Eleven Labs.
          </p>
          <p style={{ color: 'var(--encre-3)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
            {chargement ? '…' : `${seances.length} séance${seances.length !== 1 ? 's' : ''} sauvegardée${seances.length !== 1 ? 's' : ''} sur cet appareil`}
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: 'var(--encre)' }}>
            <input type="checkbox" checked={enBoucle} onChange={e => setEnBoucle(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
            🔁 Écouter en boucle
          </label>
        </div>

        {chargement && (
          <p style={{ color: 'var(--encre-3)', textAlign: 'center', padding: '2rem 0' }}>Chargement…</p>
        )}

        {!chargement && seances.length === 0 && (
          <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)', textAlign: 'center' }}>
            <p style={{ color: 'var(--encre-2)' }}>
              Ta bibliothèque est vide pour l'instant. Lance n'importe quel outil audio
              (Yoga Nidra, Hypnose, EMDR, Visualisations, Tapping, Cohérence...) — chaque
              séance générée viendra automatiquement se ranger ici pour la prochaine fois.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {seances.map(seance => {
            const info = NOMS_OUTILS[seance.outil] || { titre: seance.outil, icon: '🎵', couleur: '#888' };
            const enLecture = lectureId === seance.id;
            return (
              <div key={seance.id} style={{
                background: 'var(--carte-bg)', border: '1px solid var(--carte-border)',
                borderRadius: '14px', padding: '1.1rem 1.4rem', display: 'flex',
                gap: '1rem', alignItems: 'center', boxShadow: 'var(--ombre)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '10px', background: `${info.couleur}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', flexShrink: 0,
                }}>
                  {info.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--encre)' }}>{seance.titre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--encre-3)' }}>
                    {info.titre} · {seance.dureeMinutes} min · {new Date(seance.dateCreation).toLocaleDateString('fr-FR')}
                    {enLecture && audioEnCours && ' · 🔊 en cours'}
                  </div>
                </div>
                <button onClick={() => lancer(seance)} disabled={telechargementId === seance.id}
                  style={{
                    padding: '0.6rem 1rem', borderRadius: '999px', border: 'none',
                    background: info.couleur, color: 'white', fontWeight: 700,
                    cursor: telechargementId === seance.id ? 'default' : 'pointer',
                    opacity: telechargementId === seance.id ? 0.6 : 1,
                    flexShrink: 0,
                  }}>
                  {telechargementId === seance.id ? '⏳ Téléchargement…' : enLecture && audioEnCours ? '⏸ Pause' : '▶ Lancer'}
                </button>
                {enLecture && (
                  <button onClick={() => terminerEtSauvegarder(seance)}
                    style={{
                      padding: '0.6rem 0.9rem', borderRadius: '999px', border: '1.5px solid var(--carte-border)',
                      background: 'var(--bg-2)', color: 'var(--encre-2)', fontWeight: 600, cursor: 'pointer',
                      flexShrink: 0, fontSize: '0.85rem',
                    }}>
                    ✓ Terminé
                  </button>
                )}
                <button onClick={() => supprimer(seance.id)} title="Supprimer"
                  style={{
                    padding: '0.6rem', borderRadius: '999px', border: 'none',
                    background: 'transparent', color: 'var(--encre-3)', cursor: 'pointer',
                    flexShrink: 0, fontSize: '1rem',
                  }}>
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <SOSFlottant />
    </div>
  );
}
