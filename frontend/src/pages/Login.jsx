import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn } from 'lucide-react';
import ThemeLangToggle from '../components/ThemeLangToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      // Determine redirection based on type.
      // Admins are not part of this user side app, but if they login, maybe redirect to a static error or somewhere else.
      if (res.type === 'parent' || res.type === 'past_student') {
         navigate('/dashboard/parents');
      } else {
         setError('This portal is for Parents and Past Students. For Staff access, please use the Staff Portal.');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container items-center justify-center relative">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeLangToggle />
      </div>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <LogIn size={40} color="var(--primary-color)" />
          </div>
          <h2>{t('Welcome Back')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{t('Login to the Document Portal')}</p>
        </div>

        {error && <div className="error-text text-center mb-3 p-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('Email Address')}</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>{t('Password')}</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('Authenticating...') : t('Sign In')}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: '0.875rem' }}>
          {t("Don't have an account?")} <Link to="/register">{t('Register here')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
