import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { useTranslation } from '../context/LanguageContext';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const t = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('auth.registerSuccess'));
        navigate('/login');
      } else {
        // Mostra l'errore che arriva dal server (es: "Email già registrata")
        setError(data.message || t('auth.serverError'));
      }
    } catch (err) {
        setError(t('auth.connectionError'));
    }
  };

  return (
    <div className="auth-container-full">
      <div className="auth-card">
        <div className="auth-logo">{t('auth.logo')}</div>
        <p className="auth-slogan">{t('auth.registerTitle')}</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <input
              type="text"
              className="form-field"
              placeholder={t('auth.namePlaceholder')}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <input
              type="email"
              className="form-field"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <input
              type="password"
              className="form-field"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: 'var(--color-danger)', marginBottom: '10px' }}>{error}</p>}

          <button type="submit" className="btn-primary">
            {t('auth.registerButton')}
          </button>
        </form>

        <hr className="form-divider" />
        <div className="auth-form-text-link">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;