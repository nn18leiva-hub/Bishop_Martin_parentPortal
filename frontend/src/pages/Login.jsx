import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import loginImage from '../assets/login_image.png';
import schoolLogo from '../assets/school_logo_transparent.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      // Determine redirection based on type accurately as per the Unified Auth Protocol in Guide
      if (res.type === 'parent' || res.type === 'past_student') {
         navigate('/dashboard/parents');
      } else if (res.type === 'staff') {
          if (res.role === 'super_admin' || res.role === 'principal') {
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
    <div className="login-split-viewport">
      {/* Left Panel - Hero Image */}
      <div className="login-split-left">
        <img src={loginImage} alt="Bishop Martin Campus" className="login-split-bg-img" />
        <div className="login-split-overlay"></div>
        <div className="login-split-left-content">
          <p className="login-split-eyebrow">Parent Portal</p>
          
          <div className="login-split-brand">
            <img src={schoolLogo} alt="Bishop Martin Logo" className="login-split-brand-logo" />
            <div>
              <div className="login-split-brand-name">Bishop Martin</div>
              <div className="login-split-brand-sub">HERITAGE ACADEMY</div>
            </div>
          </div>

          <h1 className="login-split-hero-title">
            Tradition in<br />Excellence.
          </h1>

          <p className="login-split-hero-desc">
            Welcome to the Parent Portal. A centralized hub for academic records, secure communications, and administrative services.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-split-right">
        <div className="login-split-form-container">
          <div className="login-form-header">
            <img src={schoolLogo} alt="Bishop Martin Logo" className="login-form-logo" />
            <h2 className="login-split-form-title">Bishop Martin Parent Portal</h2>
            <p className="login-split-form-subtitle">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="login-error-alert animate-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Address Input */}
            <div className="login-form-group">
              <label className="login-label" htmlFor="email-input">Email Address</label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input 
                  id="email-input"
                  type="email" 
                  className="login-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com"
                  required 
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="login-form-group">
              <div className="login-split-password-header">
                <label className="login-label" htmlFor="password-input">Password</label>
                <Link to="/forgot-password" className="login-split-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input 
                  id="password-input"
                  type={showPassword ? 'text' : 'password'} 
                  className="login-input login-input-pwd-padding" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
                <button 
                  type="button" 
                  className="login-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Remember this device */}
            <div className="login-options-row">
              <label className="login-remember-container">
                <input 
                  type="checkbox" 
                  className="login-remember-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="login-btn-maroon" 
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In Securely <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Help Text */}
          <div className="login-split-help-text">
            New user?{' '}
            <Link to="/register" className="login-link-maroon">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
