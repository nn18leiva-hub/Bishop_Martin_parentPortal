import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage(data.message || 'Check your email for a reset link.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-2">Password Recovery</h2>
        <p className="text-center mb-4 text-muted" style={{ fontSize: '0.875rem' }}>
          Enter your institutional or parent email address to receive a secure password reset link.
        </p>

        {error && <div className="error-text mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {message && <div className="mb-4 p-3" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', fontSize: '0.875rem' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Registered Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Transmitting Request...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" style={{ fontSize: '0.875rem', color: '#a78bfa' }}>&larr; Return to Login Server</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
