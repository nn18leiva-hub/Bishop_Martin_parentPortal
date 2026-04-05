import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';

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
    reason: '' // form_data
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const selectedType = DOCUMENT_TYPES.find(d => d.id === parseInt(formData.document_type_id)) || DOCUMENT_TYPES[0];

  // Filtering for past students
  const availableTypes = user?.user_type === 'past_student' 
    ? DOCUMENT_TYPES.filter(d => d.name === 'transcript')
    : DOCUMENT_TYPES;

  useEffect(() => {
    // If past student, auto-select transcript
    if (user?.user_type === 'past_student') {
      setFormData(prev => ({ ...prev, document_type_id: 5 }));
    }
  }, [user]);

  // Canvas drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fff'; // Assuming dark bg
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    const payload = new FormData();
    payload.append('document_type_id', formData.document_type_id);
    payload.append('student_bemis_id', formData.student_bemis_id);
    payload.append('student_full_name', formData.student_full_name);
    payload.append('student_graduation_year_or_years_attended', formData.student_graduation_year_or_years_attended);
    payload.append('delivery_method', formData.delivery_method);

    if (selectedType.is_auto_generated) {
       payload.append('form_data', JSON.stringify({ reason: formData.reason }));
       
       // Convert canvas to blob
       if (canvasRef.current) {
          try {
             const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
             if (blob) {
                payload.append('signature_image', blob, 'signature.png');
             }
          } catch (err) {
             setError('Failed to process signature');
             return;
          }
       }
    }

    setLoading(true);
    try {
      await apiFetch('/requests/create', {
        method: 'POST',
        body: payload 
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2 mb-4" style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}>
        <ArrowLeft size={16} /> Back to Requests
      </button>

      <div className="glass-panel">
        <h2 className="mb-2">Create New Document Request</h2>
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Fill in the mandatory student details to start processing.</p>

        {error && <div className="error-text mb-4 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Document Type</label>
            <select name="document_type_id" className="form-select" value={formData.document_type_id} onChange={handleChange}>
              {availableTypes.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Student Full Name *</label>
              <input type="text" name="student_full_name" className="form-input" value={formData.student_full_name} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Student ID (BEMIS) *</label>
              <input type="text" name="student_bemis_id" className="form-input" value={formData.student_bemis_id} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Graduation Year / Years Attended (Optional)</label>
            <input type="text" name="student_graduation_year_or_years_attended" className="form-input" value={formData.student_graduation_year_or_years_attended} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Delivery Method</label>
            <select name="delivery_method" className="form-select" value={formData.delivery_method} onChange={handleChange}>
              <option value="pickup">Pick Up at Office</option>
              {selectedType.requires_payment && <option value="mailed">Mailed</option>}
              {selectedType.requires_payment && <option value="emailed">Emailed (Digital Copy)</option>}
            </select>
          </div>

          {/* Conditional Rendering */}
          {selectedType.is_auto_generated && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h3 className="mb-2" style={{ fontSize: '1.125rem' }}>Additional Form Details</h3>
              
              <div className="form-group">
                <label>Reason / Details</label>
                <textarea 
                  name="reason" 
                  className="form-input" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={formData.reason} 
                  onChange={handleChange}
                  placeholder={`Reason for ${selectedType.label.toLowerCase()}...`}
                  required
                />
              </div>

              <div className="form-group mt-3">
                <label>Parent Signature * (Please draw your signature)</label>
                <div style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: '#1a1a1a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                  <canvas 
                    ref={canvasRef}
                    width={500}
                    height={200}
                    style={{ display: 'block', cursor: 'crosshair', width: '100%' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <button type="button" onClick={clearSignature} style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedType.requires_payment && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <h3 className="mb-2 flex items-center gap-2" style={{ fontSize: '1.125rem', color: '#fbbf24' }}>
                Payment Required
              </h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                This document requires an administrative fee. You will need to upload a bank transfer receipt after submitting this request from your dashboard or via the Bank Details section.
              </p>
            </div>
          )}

          <div className="mt-4">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;
