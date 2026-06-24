import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ShieldCheck, RefreshCcw, ArrowRight, Phone, Landmark, Eye, EyeOff } from 'lucide-react';
import schoolLogo from '../assets/school_logo_transparent.png';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    user_type: 'parent',
    dob: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Map the new form fields back to what the auth context expects
      const full_name = `${formData.firstName} ${formData.lastName}`.trim();
      
      await register({
        full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        user_type: formData.user_type,
        dob: formData.user_type === 'past_student' ? formData.dob : '1970-01-01'
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-split-viewport">
      <div className="register-split-card animate-up">
        {/* Left Panel - Information & Branding */}
        <div className="register-split-left">
          <div className="register-left-content">
            
            <div className="register-brand-header">
              <img src={schoolLogo} alt="Bishop Martin Logo" className="register-brand-logo" />
              <div>
                <h1 className="register-brand-title">Bishop Martin</h1>
                <p className="register-brand-subtitle">Parent Portal Registration</p>
              </div>
            </div>

            <div className="register-info-cards">
              {/* Card 1 */}
              <div className="register-info-card">
                <div className="register-card-icon-bg">
                  <ShieldCheck size={20} className="register-card-icon" />
                </div>
                <div className="register-card-text">
                  <h3 className="register-card-title">Secure Platform</h3>
                  <p className="register-card-desc">
                    Your family's data is protected by enterprise-grade security protocols.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="register-info-card">
                <div className="register-card-icon-bg">
                  <RefreshCcw size={20} className="register-card-icon" />
                </div>
                <div className="register-card-text">
                  <h3 className="register-card-title">Real-time Updates</h3>
                  <p className="register-card-desc">
                    Access academic records, financial statements, and administrative alerts instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="register-login-prompt">
              Already registered? <Link to="/login" className="register-link-maroon">Sign in</Link>
            </div>

          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="register-split-right">
          <div className="register-form-container">
            
            {/* Step Indicator */}
            <div className="register-step-indicator">
              <div className="step-circle active">1</div>
              <div className="step-line"></div>
              <div className="step-circle">2</div>
            </div>

            <h2 className="register-form-title">Account Details</h2>
            <p className="register-form-subtitle">
              {formData.user_type === 'past_student'
                ? "Please provide your personal contact information to establish your portal access."
                : "Please provide the primary guardian's contact information to establish your portal access."}
            </p>

          {error && (
            <div className="login-error-alert animate-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            
            {/* Account Type Selection */}
            <div className="register-form-group">
              <label className="register-label" htmlFor="user_type-input">Registering as</label>
              <div className="login-input-wrapper">
                <select 
                  id="user_type-input"
                  name="user_type"
                  className="login-input register-input-no-icon" 
                  value={formData.user_type} 
                  onChange={handleChange}
                  required
                  style={{ cursor: 'pointer', appearance: 'auto' }}
                >
                  <option value="parent">Parent / Guardian</option>
                  <option value="past_student">Past Student</option>
                </select>
              </div>
            </div>

            {/* Date of Birth - Show conditionally for Past Student */}
            {formData.user_type === 'past_student' && (
              <div className="register-form-group animate-up">
                <label className="register-label" htmlFor="dob-input">Date of Birth</label>
                <div className="login-input-wrapper">
                  <input 
                    id="dob-input"
                    type="date" 
                    name="dob"
                    className="login-input register-input-no-icon" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    required={formData.user_type === 'past_student'}
                  />
                </div>
                <p className="register-input-hint">Past students must be 18 years or older to register.</p>
              </div>
            )}

            {/* First Name & Last Name Row */}
            <div className="register-form-row">
              <div className="register-form-group half-width">
                <label className="register-label" htmlFor="firstName-input">First Name</label>
                <div className="login-input-wrapper">
                  <input 
                    id="firstName-input"
                    type="text" 
                    name="firstName"
                    className="login-input register-input-no-icon" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder="e.g. Eleanor"
                    required 
                  />
                </div>
              </div>
              
              <div className="register-form-group half-width">
                <label className="register-label" htmlFor="lastName-input">Last Name</label>
                <div className="login-input-wrapper">
                  <input 
                    id="lastName-input"
                    type="text" 
                    name="lastName"
                    className="login-input register-input-no-icon" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder="e.g. Vance"
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="register-form-group">
              <label className="register-label" htmlFor="email-input">Email Address</label>
              <div className="login-input-wrapper">
                <Mail size={16} className="login-input-icon" />
                <input 
                  id="email-input"
                  type="email" 
                  name="email"
                  className="login-input" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="eleanor.vance@example.com"
                  required 
                />
              </div>
              <p className="register-input-hint">This will be your portal login ID.</p>
            </div>

            {/* Phone Number */}
            <div className="register-form-group">
              <label className="register-label" htmlFor="phone-input">Primary Phone Number</label>
              <div className="login-input-wrapper">
                <Phone size={16} className="login-input-icon" />
                <input 
                  id="phone-input"
                  type="tel" 
                  name="phone"
                  className="login-input" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="(555) 000-0000"
                  required 
                />
              </div>
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label className="register-label" htmlFor="password-input">Create Password</label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" />
                <input 
                  id="password-input"
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  className="login-input login-input-pwd-padding" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••"
                  required 
                />
                <button 
                  type="button" 
                  className="login-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="register-form-actions">
              <button 
                type="button" 
                className="register-btn-cancel"
                onClick={() => navigate('/login')}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="register-btn-continue" 
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>Continue <ArrowRight size={16} /></>
                )}
              </button>
            </div>

          </form>

        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
