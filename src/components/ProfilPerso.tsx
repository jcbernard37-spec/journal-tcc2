import { useState, useEffect } from 'react';
import { getProfil, saveProfil } from '../lib/profilPersonnel';
import type { Genre } from '../lib/profilPersonnel';
import { stockage } from '../lib/storage';

interface Props {
  onFermer?: () => void;
  compact?: boolean;
}

export default function ProfilPerso({ onFermer, compact = false }: Props) {
  const [prenom, setPrenom]   = useState('');
  const [genre, setGenre]     = useState<Genre>('N');
  const [age, setAge]         = useState<string>('');
  const [sauvegarde, setSauvegarde] = useState(false);

  useEffect(() => {
    const p = getProfil();
    if (p) { setPrenom(p.prenom || ''); setGenre(p.genre || 'N'); setAge(p.age ? String(p.age) : ''); }
  }, []);

  const ok = prenom.trim().length > 0 && genre !== 'N';

  const sauvegarder = () => {
    if (!ok) return;
    saveProfil({ prenom: prenom.trim(), genre, age: age ? parseInt(age) : null });
    stockage.declencherSync(); // pousse aussi vers Google Drive si connecté
    setSauvegarde(true);
    setTimeout(() => { setSauvegarde(false); if (onFermer) onFermer(); }, 1200);
  };

  return (
    <div style={{ background: 'var(--carte-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--carte-border)' }}>
      <h2 style={{ marginBottom: '0.4rem' }}>Mon profil</h2>
      <p style={{ color: 'var(--encre-3)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
        Ces informations permettent à Solco de s'adresser à toi correctement et de personnaliser chaque session.
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Ton prénom</label>
        <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ex : Sophie, Marc, Alex…"
          style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid var(--carte-border)', borderRadius: '10px', background: 'var(--bg)', color: 'var(--encre)', fontSize: '1rem', fontFamily: 'inherit' }} />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>Tu es…</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {([{ val: 'F' as Genre, icon: '👩', label: 'Une femme', desc: 'Solco te parle au féminin' }, { val: 'M' as Genre, icon: '👨', label: 'Un homme', desc: 'Solco te parle au masculin' }]).map(opt => (
            <div key={opt.val} onClick={() => setGenre(opt.val)}
              style={{ padding: '1rem', border: `2px solid ${genre === opt.val ? 'var(--accent)' : 'var(--carte-border)'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: genre === opt.val ? 'var(--accent-pale)' : 'transparent', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--encre)', marginBottom: '0.2rem' }}>{opt.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--encre-3)' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Ton âge</label>
        <input type="number" min={16} max={99} value={age} onChange={e => setAge(e.target.value)} placeholder="Ex : 34"
          style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid var(--carte-border)', borderRadius: '10px', background: 'var(--bg)', color: 'var(--encre)', fontSize: '1rem', fontFamily: 'inherit' }} />
        <p style={{ fontSize: '0.78rem', color: 'var(--encre-3)', marginTop: '0.4rem' }}>
          Aide l'IA à adapter le ton et les références à ta tranche d'âge.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {onFermer && (
          <button onClick={onFermer} style={{ flex: 1, padding: '0.9rem', borderRadius: '999px', background: 'var(--bg-2)', border: '1.5px solid var(--carte-border)', fontWeight: 600, cursor: 'pointer', color: 'var(--encre-2)' }}>
            Annuler
          </button>
        )}
        <button onClick={sauvegarder} disabled={!ok}
          style={{ flex: 2, padding: '0.9rem', borderRadius: '999px', background: !ok ? 'var(--carte-border)' : sauvegarde ? '#6BCF7F' : 'var(--accent)', color: !ok ? 'var(--encre-3)' : '#fff', border: 'none', fontWeight: 700, cursor: ok ? 'pointer' : 'default', transition: 'background 0.2s' }}>
          {sauvegarde ? '✓ Enregistré !' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
