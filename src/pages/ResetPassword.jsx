import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing security token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password })
      });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-2">Create New Password</h2>
        <p className="text-center mb-4 text-muted" style={{ fontSize: '0.875rem' }}>
          Please enter your new secure password below to regain access.
        </p>

        {error && <div className="error-text mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {message && <div className="mb-4 p-3" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', fontSize: '0.875rem' }}>{message}</div>}

        {!message && token && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Committing...' : 'Secure Account'}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" style={{ fontSize: '0.875rem', color: '#a78bfa' }}>Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
