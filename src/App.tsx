import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import FeuillesHub from './pages/FeuillesHub';
import PageFeuille from './pages/PageFeuille';
import SOS from './pages/SOS';
import Suivi from './pages/Suivi';
import Sauvegarde from './pages/Sauvegarde';
import Assistant from './pages/Assistant';
import Anamnese from './pages/Anamnese';
import OutilsTherapeutiques from './pages/OutilsTherapeutiques';
import EMDR from './pages/EMDR';
import EMDRProAudio from './pages/EMDRProAudio';
import YogaNidra from './pages/YogaNidra';
import YogaNidraProAudio from './pages/YogaNidraProAudio';
import Hypnose from './pages/Hypnose';
import HypnoseProAudio from './pages/HypnoseProAudio';
import Visualisations from './pages/Visualisations';
import VisualisationsProAudio from './pages/VisualisationsProAudio';
import OutilsBonus from './pages/OutilsBonus';

type Theme = 'zen' | 'japon' | 'bouddha' | 'bambou';

const THEMES: { id: Theme; label: string; classe: string; desc: string }[] = [
  { id: 'zen',     label: 'Zen',     classe: 'theme-btn-zen',     desc: 'Cabinet chaleureux' },
  { id: 'japon',   label: 'Japon',   classe: 'theme-btn-japon',   desc: 'Jardin zen' },
  { id: 'bouddha', label: 'Bouddha', classe: 'theme-btn-bouddha', desc: 'Forêt sacrée' },
  { id: 'bambou',  label: 'Nuit',    classe: 'theme-btn-bambou',  desc: 'Bambou & bougies' },
];

// ── Nav reçoit theme + setTheme du parent ──────────────────────────────────
function Nav({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const fermer = () => setMenuOuvert(false);

  return (
    <nav className="nav no-print">
      <div className="nav-inner">
        <Link to="/" className="nav-marque" onClick={fermer}>🌿 Journal TCC</Link>

        {/* Desktop */}
        <div className="nav-liens">
          <NavLink to="/hub"                   className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Tableau de bord</NavLink>
          <NavLink to="/feuilles"              className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Feuilles</NavLink>
          <NavLink to="/outils-therapeutiques" className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Outils</NavLink>
          <NavLink to="/assistant"             className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Assistant</NavLink>
          <NavLink to="/suivi"                 className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Mon suivi</NavLink>
          <NavLink to="/anamnese"              className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Mon histoire</NavLink>
          <NavLink to="/sauvegarde"            className={({ isActive }) => 'nav-lien' + (isActive ? ' actif' : '')}>Sauvegarde</NavLink>
          <Link to="/sos" className="nav-sos">SOS</Link>

          {/* Sélecteur de thème */}
          <div className="theme-selector">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`theme-btn ${t.classe} ${theme === t.id ? 'actif' : ''}`}
                title={`${t.label} — ${t.desc}`} aria-label={t.label} />
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="nav-mobile">
          <button className="btn-burger" onClick={() => setMenuOuvert(!menuOuvert)} aria-label="Menu">
            {menuOuvert ? '✕' : '☰'}
          </button>
          <Link to="/sos" className="nav-sos" onClick={fermer}>SOS</Link>
        </div>
      </div>

      {menuOuvert && (
        <div className="nav-mobile-menu">
          <NavLink to="/hub"                   className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>📊 Tableau de bord</NavLink>
          <NavLink to="/feuilles"              className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>📋 Feuilles</NavLink>
          <NavLink to="/outils-therapeutiques" className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>🧘 Outils</NavLink>
          <NavLink to="/assistant"             className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>💬 Assistant</NavLink>
          <NavLink to="/suivi"                 className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>📖 Mon suivi</NavLink>
          <NavLink to="/anamnese"              className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>📚 Mon histoire</NavLink>
          <NavLink to="/sauvegarde"            className={({ isActive }) => 'nav-lien-mobile' + (isActive ? ' actif' : '')} onClick={fermer}>💾 Sauvegarde</NavLink>

          <div className="theme-selector-mobile">
            <span>Ambiance :</span>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`theme-btn-lg ${t.id} ${theme === t.id ? 'actif' : ''}`}
                title={t.label} aria-label={t.label} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// ── App : source unique du thème ───────────────────────────────────────────
function App() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('tcc_theme') as Theme) || 'zen';
  });

  // Applique le thème sur <html> dès que ça change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tcc_theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <BrowserRouter>
      <Nav theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/"                       element={<Accueil />} />
        <Route path="/onboarding"             element={<Onboarding />} />
        <Route path="/hub"                    element={<Hub />} />
        <Route path="/feuilles"               element={<FeuillesHub />} />
        <Route path="/feuille/:slug"          element={<PageFeuille />} />
        <Route path="/assistant"              element={<Assistant />} />
        <Route path="/anamnese"               element={<Anamnese />} />
        <Route path="/outils-therapeutiques"  element={<OutilsTherapeutiques />} />
        <Route path="/emdr"                   element={<EMDR />} />
        <Route path="/emdr-pro"               element={<EMDRProAudio />} />
        <Route path="/yoga-nidra"             element={<YogaNidra />} />
        <Route path="/yoga-nidra-pro"         element={<YogaNidraProAudio />} />
        <Route path="/hypnose"                element={<Hypnose />} />
        <Route path="/hypnose-pro"            element={<HypnoseProAudio />} />
        <Route path="/visualisations"         element={<Visualisations />} />
        <Route path="/visualisations-pro"     element={<VisualisationsProAudio />} />
        <Route path="/outils-bonus"           element={<OutilsBonus />} />
        <Route path="/sos"                    element={<SOS />} />
        <Route path="/suivi"                  element={<Suivi />} />
        <Route path="/sauvegarde"             element={<Sauvegarde />} />
        <Route path="*"                       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
