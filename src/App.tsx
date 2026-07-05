import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { initializeGoogleAuth } from './lib/google-drive';
import Accueil from './pages/Accueil';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import FeuillesHub from './pages/FeuillesHub';
import PageFeuille from './pages/PageFeuille';
import SOS from './pages/SOS';
import Suivi from './pages/Suivi';
import Sauvegarde from './pages/Sauvegarde';

function Nav() {
  return (
    <nav className="nav no-print">
      <div className="nav-inner">
        <Link to="/" className="nav-marque">🌿 Journal TCC</Link>
        <div className="nav-liens">
          <NavLink to="/hub" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Tableau de bord</NavLink>
          <NavLink to="/feuilles" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Feuilles</NavLink>
          <NavLink to="/suivi" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Mon suivi</NavLink>
          <NavLink to="/sauvegarde" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Sauvegarde</NavLink>
          <Link to="/sos" className="nav-sos">SOS</Link>
        </div>
        <div className="nav-mobile">
          <Link to="/hub" className="nav-lien">Menu</Link>
          <Link to="/sos" className="nav-sos">SOS</Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  useEffect(() => {
    // Initialiser Google Auth au chargement
    initializeGoogleAuth().catch(() => {
      // Silencieux si pas configuré
    });
  }, []);

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/feuilles" element={<FeuillesHub />} />
        <Route path="/feuille/:slug" element={<PageFeuille />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/suivi" element={<Suivi />} />
        <Route path="/sauvegarde" element={<Sauvegarde />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
