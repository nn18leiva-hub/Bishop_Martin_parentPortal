import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    user_type: 'parent',
    dob: ''
  });
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

    // Frontend validation for Past Student age
    if (formData.user_type === 'past_student') {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setError('Past students must be 18 years or older to register.');
        return;
      }
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container items-center justify-center py-4">
      <div className="glass-panel" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <UserPlus size={40} color="var(--primary-color)" />
          </div>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Register for the Document Portal</p>
        </div>

        {error && <div className="error-text text-center mb-3 p-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="full_name"
              className="form-input" 
              value={formData.full_name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              name="phone"
              className="form-input" 
              value={formData.phone} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="user_type" className="form-select" value={formData.user_type} onChange={handleChange}>
              <option value="parent">Parent</option>
              <option value="past_student">Past Student</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input 
              type="date" 
              name="dob"
              className="form-input" 
              value={formData.dob} 
              onChange={handleChange} 
              required 
            />
            {formData.user_type === 'past_student' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginTop: '0.25rem' }}>
                Must be at least 18 years old.
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
