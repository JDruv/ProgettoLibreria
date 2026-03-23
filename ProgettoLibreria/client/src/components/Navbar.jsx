import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { useTranslation } from '../context/LanguageContext';

function Navbar() {
  const t = useTranslation();
  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        <li><Link to="/">{t('nav.home')}</Link></li>
        <li><Link to="/utenti">{t('nav.utenti')}</Link></li>
        <li><Link to="/libri">{t('nav.gestione')}</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
