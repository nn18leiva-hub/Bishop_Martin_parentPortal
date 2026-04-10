import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';


const DOCUMENT_TYPES = [
  { id: 1, name: 'lateness_form', label: 'Lateness Form', is_auto_generated: true, requires_payment: false },
  { id: 2, name: 'absence_form', label: 'Absence Form', is_auto_generated: true, requires_payment: false },
  { id: 3, name: 'permission_slip', label: 'Permission Slip', is_auto_generated: true, requires_payment: false },
  { id: 4, name: 'enrolment_letter', label: 'Enrolment Letter', is_auto_generated: false, requires_payment: true },
  { id: 5, name: 'transcript', label: 'Transcript', is_auto_generated: false, requires_payment: true },
];

const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    document_type_id: 1,
    student_bemis_id: '',
    student_full_name: '',
    student_graduation_year_or_years_attended: '',
    delivery_method: 'pickup',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const sigCanvas = useRef(null);

  const selectedType = DOCUMENT_TYPES.find(d => d.id === parseInt(formData.document_type_id)) || DOCUMENT_TYPES[0];

  const availableTypes = user?.user_type === 'past_student' 
    ? DOCUMENT_TYPES.filter(d => d.name === 'transcript')
    : DOCUMENT_TYPES;

  useEffect(() => {
    if (user?.user_type === 'past_student') {
      setFormData(prev => ({ ...prev, document_type_id: 5 }));
    }
  }, [user]);

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const handleSignatureEnd = () => {
    // Basic handler for end-of-stroke
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.student_full_name || !formData.student_bemis_id) {
       setError("Student Full Name and ID are strictly required.");
       return;
    }

    if (selectedType.is_auto_generated && sigCanvas.current.isEmpty()) {
       setError("Signature is required for this form.");
       return;
    }

    const payload = new FormData();
    payload.append('document_type_id', formData.document_type_id);
    payload.append('student_bemis_id', formData.student_bemis_id);
    payload.append('student_full_name', formData.student_full_name);
    payload.append('student_graduation_year_or_years_attended', formData.student_graduation_year_or_years_attended);
    payload.append('delivery_method', formData.delivery_method);

    if (selectedType.is_auto_generated) {
       payload.append('form_data', JSON.stringify({ reason: formData.reason }));
       const blob = await new Promise(resolve => sigCanvas.current.getTrimmedCanvas().toBlob(resolve, 'image/png'));
       if (blob) {
         payload.append('signature_image', blob, 'signature.png');
       }
    }

    setLoading(true);
    try {
      await apiFetch('/requests/create', {
        method: 'POST',
        body: payload 
      });
      
      if (selectedType.requires_payment) navigate('/dashboard/parents/bank-details');
      else navigate('/dashboard/parents');
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard/parents')} className="btn-secondary flex items-center gap-3 mb-6">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-panel animate-up">
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Document Request</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>Please provide student details to generate your official form.</p>
        </div>

        {error && <div className="error-text mb-6 p-4" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: '16px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid form-grid-2">
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Document Type *</label>
            <select name="document_type_id" className="form-select" value={formData.document_type_id} onChange={handleChange}>
              {availableTypes.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student Name *</label>
            <input type="text" name="student_full_name" className="form-input" placeholder="Full Legal Name" value={formData.student_full_name} onChange={handleChange} required />
          </div>
            
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student ID (BEMIS) *</label>
            <input type="text" name="student_bemis_id" className="form-input" placeholder="e.g. 2024-XXXX" value={formData.student_bemis_id} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Years Attended</label>
            <input type="text" name="student_graduation_year_or_years_attended" className="form-input" placeholder="e.g. 2020-2024" value={formData.student_graduation_year_or_years_attended} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Delivery Preference *</label>
            <select name="delivery_method" className="form-select" value={formData.delivery_method} onChange={handleChange}>
              <option value="pickup">Pick Up at School Office</option>
              {selectedType.requires_payment && <option value="mailed">Mail to Address</option>}
              {selectedType.requires_payment && <option value="emailed">Email Secure PDF</option>}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '1rem', color: 'var(--text-muted)' }}>Digital Signature *</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please draw your signature below. Click 'Clear' if you need to redo it before submitting.</p>
              
              <div className="sig-canvas-container" style={{ position: 'relative', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                <SignatureCanvas 
                  ref={sigCanvas}
                  penColor="#818cf8"
                  canvasProps={{ className: 'signature-canvas', style: { width: '100%', height: '300px' } }}
                />
                <button type="button" onClick={clearSignature} style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'var(--danger-color)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)' }}>
                  Clear / Redo
                </button>
              </div>
            </div>
          </div>

          {selectedType.requires_payment && (
            <div style={{ gridColumn: '1 / -1', padding: '2rem', background: 'rgba(245, 158, 11, 0.04)', borderRadius: '24px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <p style={{ color: '#fbbf24', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <strong>Important:</strong> This document requires a processing fee. Please submit the request first, then upload your payment receipt from the <strong>Payments</strong> section.
              </p>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', marginTop: '3rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem' }} disabled={loading}>
              {loading ? 'Processing Application...' : 'Submit Official Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;
