import { useRef, useState, useEffect } from 'react';
import { stockage } from '../lib/storage';
import { connectGoogle, disconnectGoogle, isConnected, getUserEmail } from '../lib/google-drive';

export default function Sauvegarde() {
  const fichierRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [googleConnected, setGoogleConnected] = useState(isConnected());
  const [emailGoogle, setEmailGoogle] = useState(getUserEmail());
  const entrees = stockage.getEntrees();

  useEffect(() => {
    setGoogleConnected(isConnected());
    setEmailGoogle(getUserEmail());
  }, []);

  const connecterGoogle = async () => {
    const ok = await connectGoogle();
    if (ok) {
      setGoogleConnected(true);
      setEmailGoogle(getUserEmail());
      setMessage('✓ Connecté à Google Drive ! Tes données se synchronisent maintenant automatiquement.');
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage('✗ Connexion échouée. Vérifie que tu as accepté l\'autorisation.');
    }
  };

  const deconnecter = async () => {
    await disconnectGoogle();
    setGoogleConnected(false);
    setEmailGoogle('');
    setMessage('✓ Déconnecté de Google Drive.');
  };

  const importer = async (f: File | undefined) => {
    if (!f) return;
    const ok = await stockage.importer(f);
    setMessage(ok
      ? '✓ Sauvegarde restaurée ! Ton profil et toutes tes entrées sont de retour.'
      : '✗ Ce fichier ne semble pas être une sauvegarde du Journal TCC.');
    if (ok) setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="page">
      <div className="conteneur-etroit apparition" style={{ paddingTop: '2.2rem' }}>
        <h1>Sauvegarde &amp; Google Drive</h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem' }}>
          Tes données vivent sur <strong>cet appareil</strong> (rien n'est envoyé sur un serveur).
          Pour les retrouver partout — téléphone, PC du travail — connecte ton Google Drive : tout se synchronise automatiquement.
        </p>

        {message && (
          <div className={`encart ${message.startsWith('✓') ? 'encart-succes' : 'encart-crise'}`} role="status">
            {message}
          </div>
        )}

        <div className="carte" style={{ marginTop: '1.6rem' }}>
          <h3>🔐 Google Drive — Synchronisation automatique</h3>
          {googleConnected ? (
            <>
              <div className="encart encart-succes" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
                ✓ Connecté au compte : <strong>{emailGoogle || 'Google'}</strong>
              </div>
              <p style={{ color: 'var(--encre-2)', margin: '1rem 0 0' }}>
                Tes données se synchronisent automatiquement dans un dossier « Journal TCC » de ton Drive.
                Aucun clic supplémentaire — tout se fait tout seul. Sur ton téléphone ou un autre PC ?
                Reconnecte-toi simplement avec le même compte Google.
              </p>
              <button className="btn btn-doux" onClick={deconnecter} style={{ marginTop: '1rem' }}>
                Se déconnecter de Google Drive
              </button>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--encre-2)', margin: '0.8rem 0' }}>
                Clique ci-dessous pour connecter ton Google Drive. Tu autoriseras l'app à créer un
                dossier privé « Journal TCC » et à sauvegarder tes données dedans. Rien que toi ne peux voir.
              </p>
              <button className="btn btn-primaire" onClick={connecterGoogle} style={{ marginTop: '0.8rem' }}>
                Se connecter à Google Drive
              </button>
              <p style={{ color: 'var(--encre-3)', fontSize: '0.85rem', marginTop: '0.6rem' }}>
                Pour cela, tu dois d'abord avoir créé une clé OAuth dans Google Cloud Console
                (voir instructions ci-dessous).
              </p>
            </>
          )}
        </div>

        <div className="carte" style={{ marginTop: '1.6rem' }}>
          <h3>⬇️ 1. Exporter ma sauvegarde</h3>
          <p style={{ color: 'var(--encre-2)', margin: '0.5rem 0 1rem' }}>
            Télécharge un fichier contenant ton profil et tes <strong>{entrees.length}</strong> entrée{entrees.length > 1 ? 's' : ''}.
            Dépose-le ensuite dans un dossier « Journal TCC » de ton Google Drive : il sera
            accessible depuis tous tes appareils.
          </p>
          <button className="btn btn-primaire" onClick={() => stockage.exporterTout()}>
            Télécharger ma sauvegarde
          </button>
          <p style={{ color: 'var(--encre-3)', fontSize: '0.85rem', marginTop: '0.8rem' }}>
            Astuce : fais-le une fois par semaine, ou après une grosse session d'écriture.
          </p>
        </div>

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>⬆️ 2. Restaurer sur un autre appareil</h3>
          <p style={{ color: 'var(--encre-2)', margin: '0.5rem 0 1rem' }}>
            Sur ton téléphone ou un autre ordinateur : ouvre ce site, viens sur cette page,
            et charge le fichier de sauvegarde depuis ton Google Drive. Tout revient
            instantanément.
          </p>
          <input ref={fichierRef} type="file" accept=".json,application/json" hidden
            onChange={e => importer(e.target.files?.[0])} />
          <button className="btn btn-contour" onClick={() => fichierRef.current?.click()}>
            Charger un fichier de sauvegarde
          </button>
        </div>

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>⚙️ Configuration de Google Drive (une seule fois)</h3>
          <ol style={{ color: 'var(--encre-2)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
            <li>
              Va sur <strong><a href="https://console.cloud.google.com" target="_blank" rel="noopener">console.cloud.google.com</a></strong>
            </li>
            <li>
              Crée un nouveau projet : « Journal TCC »
            </li>
            <li>
              Cherche « Google Drive API » **ENABLE**
            </li>
            <li>
              Va à **Credentials** **Create Credentials** **OAuth 2.0 Client ID**
              <ul style={{ marginTop: '0.4rem', marginLeft: '1rem' }}>
                <li>Type : **Web application**</li>
                <li>Authorized JavaScript origins : <code>http://localhost:5173</code></li>
                <li>Authorized redirect URIs : <code>http://localhost:5173</code></li>
                <li>(Ces URL changeront après déploiement — on ajoute Vercel quand c'est prêt)</li>
              </ul>
            </li>
            <li>
              Copie ton **Client ID**
            </li>
            <li>
              Ouvre le fichier `src/lib/google-drive.ts` et remplace `VITE_GOOGLE_CLIENT_ID` par ton Client ID
            </li>
            <li>
              Sauvegarde, relance `npm run dev`, et clique sur « Se connecter à Google Drive » ici
            </li>
          </ol>
        </div>

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>📱 Accéder depuis ton téléphone</h3>
          <p style={{ color: 'var(--encre-2)', marginTop: '0.5rem' }}>
            Une fois l'app déployée sur <strong>Vercel</strong> (voir ci-dessous), tu peux y accéder
            depuis n'importe quel appareil, n'importe quand — téléphone, PC du travail, tablette.
            <br /><br />
            <strong>Tes données se synchronisent automatiquement</strong> vers ton Google Drive dès que tu remplis
            une feuille. Change d'appareil, reconnecte-toi avec le même compte, et tout réapparaît.
          </p>
        </div>

        <div className="carte" style={{ marginTop: '1.4rem' }}>
          <h3>🚀 Déployer sur Vercel (gratuit)</h3>
          <p style={{ color: 'var(--encre-2)', margin: '0.5rem 0 1rem' }}>
            Vercel te permet d'avoir une URL publique pour ton app, accessible partout.
          </p>
          <ol style={{ color: 'var(--encre-2)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
            <li>Va sur <strong><a href="https://vercel.com" target="_blank" rel="noopener">vercel.com</a></strong> Sign up avec GitHub</li>
            <li>Crée un repo GitHub : `journal-tcc`</li>
            <li>Mets ton code dedans (git push)</li>
            <li>Vercel l'importera automatiquement, déploiera, et te donnera une URL : `https://journal-tcc.vercel.app`</li>
            <li>
              Va sur Google Cloud Console, édite ton OAuth Client ID, et ajoute :
              <ul style={{ marginTop: '0.3rem', marginLeft: '1rem' }}>
                <li>Authorized JavaScript origins : <code>https://journal-tcc.vercel.app</code></li>
                <li>Authorized redirect URIs : <code>https://journal-tcc.vercel.app</code></li>
              </ul>
            </li>
            <li>C'est bon ! Ouvre l'URL Vercel sur ton téléphone, connecte ton Google Drive, et c'est synchronisé</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
