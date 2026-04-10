import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      // Determine redirection based on type.
      // Determine redirection based on type accurately as per the Unified Auth Protocol in Guide
      if (res.type === 'parent' || res.type === 'past_student') {
         navigate('/dashboard/parents');
      } else if (res.type === 'staff') {
         if (res.role === 'super_admin') {
           navigate('/superadmin');
         } else { // admin or viewer
           navigate('/staff');
         }
      } else {
         setError('Unknown user type.');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      <div className="aura-container">
        <div className="aura-circle aura-1"></div>
        <div className="aura-circle aura-2"></div>
        <div className="aura-circle aura-3"></div>
      </div>

      <div className="glass-panel login-card-highlight animate-up" style={{ maxWidth: '440px', width: '90%', padding: '3.5rem 2.5rem', borderRadius: '32px' }}>
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="login-icon-float" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.25rem', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <LogIn size={48} color="var(--primary-color)" />
            </div>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: '0.5rem' }}>Bishop Martin</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Global Admissions Portal</p>
        </div>

        {error && <div className="error-text text-center mb-6 p-3 animate-up" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label style={{ color: '#fff', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Institutional Email</label>
            <input 
              type="email" 
              className="form-input input-glow" 
              style={{ background: 'rgba(255,255,255,0.03)', height: '56px', fontSize: '1rem' }}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="e.g. name@institutional.edu"
              required 
            />
          </div>
          
          <div className="form-group mb-10">
            <label style={{ color: '#fff', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Access Credential</label>
            <input 
              type="password" 
              className="form-input input-glow" 
              style={{ background: 'rgba(255,255,255,0.03)', height: '56px', fontSize: '1rem' }}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ height: '60px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '18px' }} disabled={loading}>
            {loading ? 'Decrypting Hash...' : 'Establish Connection'}
          </button>
        </form>

        <div className="text-center mt-10" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Credential Recovery</Link>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>New to the Network? </span>
            <Link to="/register" style={{ fontWeight: 700, color: '#10b981' }}>Onboard Now</Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center mt-8" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
          Biometric Ready & SSL Encrypted
        </div>
      </div>
    </div>
  );
};

export default Login;
