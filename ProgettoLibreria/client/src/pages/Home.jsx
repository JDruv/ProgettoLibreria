import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/BookAnimation.css'; // Importa lo stile del libro
import { useAuth } from '../context/AuthContext'; // Per sapere se è Admin
import { useTranslation, useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { isAdmin } = useAuth(); // Ottieni lo stato Admin
  const t = useTranslation();
  const { lang, toggle } = useLanguage();

  // Determina dove mandare l'utente e cosa scrivere sul bottone
  const linkDestination = isAdmin ? "/libri" : "/catalogo";
  const linkText = isAdmin ? t('home.manageBtn') : t('home.exploreBtn');

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="language-toggle">
          <button onClick={toggle} className="lang-switcher" title={lang === 'it' ? 'Switch to English' : 'Passa all\'italiano'}>
            <span className={`lang-badge ${lang === 'it' ? 'active' : ''}`}>IT</span>
            <span className="lang-divider">/</span>
            <span className={`lang-badge ${lang === 'en' ? 'active' : ''}`}>EN</span>
          </button>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <p className="hero-description">{t('home.description')}</p>
          
          {/* Link Dinamico in base al ruolo */}
          <Link to={linkDestination} className="btn-primary btn-hero">
            {linkText}
          </Link>
        </div>
        
        {/* --- ANIMAZIONE LIBRO (Allineata a destra via CSS) --- */}
        <div className="hero-visual">
          <div className="book">
            <div className="book__pg-shadow"></div>
            <div className="book__pg"></div>
            <div className="book__pg book__pg--2"></div>
            <div className="book__pg book__pg--3"></div>
            <div className="book__pg book__pg--4"></div>
            <div className="book__pg book__pg--5"></div>
          </div>
        </div>
        {/* --- FINE ANIMAZIONE --- */}
        
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <h2 className="section-title">{t('home.featuresTitle')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>{t('home.feature1.title')}</h3>
            <p>{t('home.feature1.desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>{t('home.feature2.title')}</h3>
            <p>{t('home.feature2.desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌙</div>
            <h3>{t('home.feature3.title')}</h3>
            <p>{t('home.feature3.desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>{t('home.feature4.title')}</h3>
            <p>{t('home.feature4.desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>{t('home.feature5.title')}</h3>
            <p>{t('home.feature5.desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t('home.feature6.title')}</h3>
            <p>{t('home.feature6.desc')}</p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div className="stat-card stat-1">
          <div className="stat-number">∞</div>
          <div className="stat-label">{t('home.stats1')}</div>
        </div>
        <div className="stat-card stat-2">
          <div className="stat-number">100%</div>
          <div className="stat-label">{t('home.stats2')}</div>
        </div>
        <div className="stat-card stat-3">
          <div className="stat-number">🚀</div>
          <div className="stat-label">{t('home.stats3')}</div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works">
        <h2 className="section-title">{t('home.howTitle')}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>{t('home.step1.title')}</h3>
            <p>{t('home.step1.desc')}</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>{t('home.step2.title')}</h3>
            <p>{t('home.step2.desc')}</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>{t('home.step3.title')}</h3>
            <p>{t('home.step3.desc')}</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>{t('home.step4.title')}</h3>
            <p>{t('home.step4.desc')}</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <h2>{t('home.ctaTitle')}</h2>
        <p>{t('home.ctaDesc')}</p>
        <Link to={linkDestination} className="btn-primary btn-cta">
          {t('home.ctaBtn')} {isAdmin ? t('nav.gestione') : t('nav.catalogo')}
        </Link>
      </section>

      {/* FOOTER INFO */}
      <footer className="home-footer">
        <p>{t('home.footer')}</p>
      </footer>
    </div>
  );
};

export default Home;