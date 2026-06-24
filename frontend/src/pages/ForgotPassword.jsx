import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('idle'); // 'idle', 'awaiting_code', 'success'
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Polling for admin approval status
  useEffect(() => {
    if (stage !== 'awaiting_code' || !email) return;

    let active = true;
    const checkApproval = async () => {
      try {
        const res = await apiFetch(`/auth/reset-status?email=${encodeURIComponent(email)}`);
        if (active && res.approved) {
          setIsApproved(true);
          setMessage('Your password reset request has been approved by the Administrator! Fill in your new password and click Confirm.');
        }
      } catch (err) {
        console.error('Failed checking reset status:', err);
      }
    };

    checkApproval();
    const interval = setInterval(checkApproval, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [stage, email]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsApproved(false);
    setLoading(true);

    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage(data.message || 'Reset request initialized.');
      setStage('awaiting_code');
    } catch (err) {
      setError(err.message || 'Failed to send reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (!code && !isApproved) return setError('Verification PIN code is required unless approved by an Administrator.');

    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: code || '', newPassword, email })
      });
      setMessage(data.message || 'Password has been successfully reset.');
      setStage('success');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setIsApproved(false);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px' }}>
        <h2 className="text-center mb-2">Password Recovery</h2>
        
        {stage !== 'success' && (
          <p className="text-center mb-4 text-muted" style={{ fontSize: '0.875rem' }}>
            {stage === 'idle' 
              ? 'Enter your institutional or parent email address to request a secure password change.' 
              : 'Enter the 6-digit PIN code from your administrator or wait for remote approval.'
            }
          </p>
        )}

        {error && <div className="error-text mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', fontSize: '0.875rem' }}>{error}</div>}
        {message && <div className="mb-4 p-3" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', fontSize: '0.875rem' }}>{message}</div>}

        {stage === 'idle' && (
          <form onSubmit={handleRequestReset}>
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
              {loading ? 'Transmitting Request...' : 'Send Reset Request'}
            </button>
          </form>
        )}

        {stage === 'awaiting_code' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group mb-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>6-Digit Verification PIN</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 123456" 
                value={code} 
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required={!isApproved} 
                style={{ letterSpacing: '4px', fontSize: '1.25rem', fontFamily: 'monospace', width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              {isApproved && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Approved by Administrator
                </div>
              )}
            </div>

            <div className="form-group mb-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>

            <div className="form-group mb-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Updating Credentials...' : 'Confirm & Update Password'}
            </button>

            <button type="button" onClick={() => { setStage('idle'); setMessage(''); setError(''); }} className="btn-secondary mt-3" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer', marginTop: '0.75rem' }}>
              Cancel Request
            </button>
          </form>
        )}

        {stage === 'success' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
            <ShieldCheck size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Credentials Updated</h4>
            <p style={{ color: '#cccccc', fontSize: '0.9rem', marginBottom: 0 }}>
              Your password has been reset successfully. Redirecting you to the login screen...
            </p>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/login" style={{ fontSize: '0.875rem', color: '#a78bfa' }}>&larr; Return to Login Server</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
