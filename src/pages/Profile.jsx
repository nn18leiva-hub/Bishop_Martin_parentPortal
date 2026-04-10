import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, ShieldCheck, User } from 'lucide-react';
import { apiFetch } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  
  // States: 'idle', 'requesting', 'awaiting_code', 'verifying', 'success'
  const [stage, setStage] = useState('idle');
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestCode = async () => {
    setError('');
    setMessage('');
    setStage('requesting');
    try {
      const res = await apiFetch('/auth/request-profile-code', { method: 'POST' });
      setMessage(res.message || 'Verification code dispatched to your email.');
      setStage('awaiting_code');
    } catch (err) {
      setError(err.message || 'Failed to request code.');
      setStage('idle');
    }
  };

  const handleVerifyAndChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (code.length !== 6) return setError('Verification code must be exactly 6 digits.');

    setError('');
    setStage('verifying');
    try {
      const res = await apiFetch('/auth/change-profile-password', {
        method: 'POST',
        body: JSON.stringify({ code, newPassword })
      });
      setMessage(res.message || 'Password updated successfully!');
      setStage('success');
      setCode('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Code may be invalid or expired.');
      setStage('awaiting_code');
    }
  };

  if (!user) return null;

  return (
    <div className="animate-up" style={{ padding: '0 1rem' }}>
      <div className="flex flex-responsive justify-between items-start mb-6 gap-2">
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Account Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal profile and security boundaries.</p>
        </div>
      </div>

      <div className="grid-responsive-admin">
        {/* Profile Details Block */}
        <div className="flex-col gap-4" style={{ display: 'flex' }}>
            <div className="glass-panel" style={{ borderTop: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                <h3 className="mb-4 flex items-center gap-2" style={{ color: '#93c5fd' }}><User size={20} /> Personal Identification</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Full Legal Name</p>
                    <p style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 500 }}>{user.full_name || 'N/A'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Registered Email</p>
                    <p style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={16} color="var(--primary-color)" /> {user.email || 'N/A'}
                    </p>
                </div>

                <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Access Node Clearance</p>
                    <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        {(user.role || user.type || 'Standard').toUpperCase()}
                    </span>
                </div>
            </div>
        </div>

        {/* Password Security Block */}
        <div className="glass-panel" style={{ borderTop: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)', alignSelf: 'start' }}>
            <h3 className="mb-4 flex items-center gap-2" style={{ color: '#fcd34d' }}><KeyRound size={20} /> Data Authorization Key</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                For your security, resetting your portal password requires email verification. We will send a secure 6-digit pin to your registered inbox to authorize this change.
            </p>

            {error && <div className="error-text mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
            {message && <div className="mb-4 p-3" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', fontSize: '0.9rem' }}>{message}</div>}

            {stage === 'idle' && (
                <button 
                  onClick={handleRequestCode} 
                  className="btn-primary" 
                  style={{ background: '#f59e0b', borderColor: '#d97706', color: '#000', fontWeight: 700, width: 'auto' }}>
                    Request Verification Pin
                </button>
            )}

            {stage === 'requesting' && (
                <button className="btn-primary" disabled style={{ width: 'auto', background: 'rgba(245, 158, 11, 0.5)', cursor: 'wait' }}>
                    Authenticating Node...
                </button>
            )}

            {(stage === 'awaiting_code' || stage === 'verifying') && (
                <form onSubmit={handleVerifyAndChange} className="animate-up" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div className="form-group mb-4">
                        <label style={{ color: '#fcd34d' }}>6-Digit Verification Pin</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. 123456" 
                            value={code} 
                            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            required 
                            style={{ letterSpacing: '4px', fontSize: '1.25rem', fontFamily: 'monospace' }}
                        />
                    </div>
                    <div className="form-group mb-6">
                        <label style={{ color: '#fcd34d' }}>New Secure Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ background: '#f59e0b', borderColor: '#d97706', color: '#000', fontWeight: 700, width: '100%' }} disabled={stage === 'verifying'}>
                        {stage === 'verifying' ? 'Validating Hash...' : 'Confirm & Update Password'}
                    </button>
                    
                    <button type="button" onClick={() => setStage('idle')} className="btn-secondary mt-3" style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem' }}>
                        Cancel Request
                    </button>
                </form>
            )}

            {stage === 'success' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                    <ShieldCheck size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Authentication Matrix Updated</h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Your new password is now active. Any subsequent logins will require these credentials.
                    </p>
                    <button onClick={() => { setStage('idle'); setMessage(''); }} className="btn-primary" style={{ margin: '0 auto', width: 'auto' }}>
                        Acknowledge
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
