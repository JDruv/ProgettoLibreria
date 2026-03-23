import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from './context/LanguageContext';

// Importa le pagine
import Home from './pages/Home';
import GestioneLibri from './pages/GestioneLibri';
import Login from './pages/Login';
import Register from './pages/Register';
import VisualizzaUtenti from './pages/VisualizzaUtenti';
import CatalogoLibri from './pages/CatalogoLibri';
import IMieiPrestiti from './pages/IMieiPrestiti';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function MainLayout() {
  const { logout, isAdmin } = useAuth();
  const t = useTranslation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* BARRA DI NAVIGAZIONE */}
      <nav style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between', /* Separa sinistra e destra */
          padding: '20px 40px', 
          background: 'var(--color-bg-card)', 
          boxShadow: 'var(--shadow-medium)',
          marginBottom: '30px'
        }}>
        
        {/* GRUPPO LINK (A Sinistra) */}
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <Link to="/">{t('nav.home')}</Link>
          
          {/* MENU ADMIN */}
          {isAdmin && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/libri">{t('nav.gestione')}</Link>
              <Link to="/utenti">{t('nav.utenti')}</Link>
            </>
          )}

          {/* MENU UTENTE NORMALE */}
          {!isAdmin && (
            <>
              <Link to="/catalogo">{t('nav.catalogo')}</Link>
              <Link to="/mieiprestiti">{t('nav.mieiprestiti')}</Link>
            </>
          )}
        </div>

        {/* BOTTONE LOGOUT (A Destra) */}
        <button 
          onClick={logout} 
          className="btn-secondary" 
          style={{ 
            width: 'auto', /* Fondamentale: impedisce di allungarsi */
            padding: '8px 20px', 
            fontSize: '0.9rem',
            margin: 0 /* Rimuoviamo margin-left auto perché usiamo space-between */
          }}
        >
          {t('nav.logout')}
        </button>
      </nav>

      {/* CONTENUTO PAGINA */}
      <main style={{ flexGrow: 1, padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Rotte Admin */}
          {isAdmin && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/libri" element={<GestioneLibri />} />
              <Route path="/utenti" element={<VisualizzaUtenti />} />
            </>
          )}

          {/* Rotte Utente */}
          {!isAdmin && (
            <>
              <Route path="/catalogo" element={<CatalogoLibri />} />
              <Route path="/mieiprestiti" element={<IMieiPrestiti />} />
              <Route path="/libri" element={<Navigate to="/catalogo" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default function RootApp() {
  return <AuthProvider><App /></AuthProvider>;
}