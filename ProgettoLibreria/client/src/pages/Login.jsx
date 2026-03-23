import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const t = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Passiamo token E se è admin
        login(data.token, data.isAdmin); 
      } else {
        setError(data.message);
      }
    } catch (err) { setError(t('auth.serverError')); }
  };

  return (
    <div className="auth-container-full">
      <div className="auth-card">
        <div className="auth-logo">{t('auth.logo')}</div>
        <p className="auth-slogan">{t('auth.loginTitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <input type="email" className="form-field" placeholder={t('auth.loginEmailPlaceholder')} value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <input type="password" className="form-field" placeholder={t('auth.loginPasswordPlaceholder')} value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          {error && <p style={{color:'red'}}>{error}</p>}
          <button type="submit" className="btn-primary">{t('auth.loginButton')}</button>
        </form>
        <div className="auth-form-text-link">{t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link></div>
      </div>
    </div>
  );
}
export default Login;