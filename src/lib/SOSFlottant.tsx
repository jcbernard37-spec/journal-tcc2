import { Link } from 'react-router-dom';

/**
 * Bouton SOS flottant — visible en bas à droite de toutes les pages d'outils.
 * Accessible même en session les yeux fermés → permet de sortir en urgence.
 */
export default function SOSFlottant() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 200,
    }}>
      <Link to="/sos">
        <button style={{
          background: 'var(--crise)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          padding: '0.75rem 1.25rem',
          fontWeight: 800,
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🆘 SOS
        </button>
      </Link>
    </div>
  );
}
