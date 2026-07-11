import { useState, useEffect } from 'react';
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
import Assistant from './pages/Assistant';

function Nav() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <nav className="nav no-print">
      <div className="nav-inner">
        <Link to="/" className="nav-marque" onClick={() => setMenuOuvert(false)}>🌿 Journal TCC</Link>
        <div className="nav-liens">
          <NavLink to="/hub" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Tableau de bord</NavLink>
          <NavLink to="/feuilles" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Feuilles</NavLink>
          <NavLink to="/assistant" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Assistant</NavLink>
          <NavLink to="/suivi" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Mon suivi</NavLink>
          <NavLink to="/sauvegarde" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Sauvegarde</NavLink>
          <Link to="/sos" className="nav-sos">SOS</Link>
        </div>
        {/* Menu mobile avec hamburger */}
        <div className="nav-mobile">
          <button 
            className="btn-burger" 
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label="Menu"
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
          <Link to="/sos" className="nav-sos">SOS</Link>
        </div>
      </div>
      
      {/* Menu déroulant mobile */}
      {menuOuvert && (
        <div className="nav-mobile-menu">
          <NavLink to="/hub" className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={() => setMenuOuvert(false)}>📊 Tableau de bord</NavLink>
          <NavLink to="/feuilles" className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={() => setMenuOuvert(false)}>📋 Feuilles</NavLink>
          <NavLink to="/assistant" className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={() => setMenuOuvert(false)}>💬 Assistant</NavLink>
          <NavLink to="/suivi" className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={() => setMenuOuvert(false)}>📖 Mon suivi</NavLink>
          <NavLink to="/sauvegarde" className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={() => setMenuOuvert(false)}>💾 Sauvegarde</NavLink>
        </div>
      )}
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
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/suivi" element={<Suivi />} />
        <Route path="/sauvegarde" element={<Sauvegarde />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
