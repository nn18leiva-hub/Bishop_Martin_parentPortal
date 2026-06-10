import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  AlertTriangle, 
  GraduationCap, 
  Plus, 
  Mail, 
  MapPin, 
  Clock, 
  Check, 
  ShieldAlert, 
  UserCheck, 
  ChevronRight,
  PenTool,
  Trash2
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const DOCUMENT_TYPES = [
  { id: 1, name: 'transcript', label: 'Official Transcript', is_auto_generated: false, requires_payment: true, base_price: 15, est_time: '2-3 Business Days', description: 'Certified copy of student academic records, grades, and completion status.' },
  { id: 2, name: 'enrollment_verification', label: 'Enrollment Verification', is_auto_generated: true, requires_payment: false, base_price: 0, est_time: 'Instant Digital PDF', description: 'Official letter verifying current enrollment status and academic standing.' },
  { id: 3, name: 'disciplinary_record', label: 'Disciplinary Record', is_auto_generated: true, requires_payment: false, base_price: 0, est_time: 'Instant Digital PDF', description: "Official summary of student's disciplinary and conduct history." },
  { id: 4, name: 'duplicate_diploma', label: 'Duplicate Diploma', is_auto_generated: false, requires_payment: true, base_price: 35, est_time: '5-7 Business Days', description: 'Official replacement copy of graduation certificate and diploma.' },
  { id: 5, name: 'custom_request', label: 'Custom Request', is_auto_generated: false, requires_payment: true, base_price: 0, est_time: '1-3 Business Days', description: 'Specific letters, custom endorsements, or other custom forms.' },
];

const STUDENT_PROFILES = [
  { id: 'eleanor', name: 'Eleanor Vance', bemis: 'STU-9824', grade: 'Grade 10', color: '#7a0c2e' },
  { id: 'theodore', name: 'Theodore Hayes', bemis: 'STU-7511', grade: 'Grade 8', color: '#1e3a8a' },
];

const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPastStudent = user?.user_type === 'past_student' || user?.type === 'past_student';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    document_type_id: 1, // Default to transcript (ID 1)
    student_source: isPastStudent ? 'self' : 'profile', // 'profile' or 'custom' or 'self'
    selected_profile_id: isPastStudent ? 'self' : 'eleanor', // 'eleanor', 'theodore', 'custom', or 'self'
    student_full_name: isPastStudent ? user?.full_name || '' : 'Eleanor Vance',
    student_bemis_id: isPastStudent ? 'STU-1000' : 'STU-9824',
    student_graduation_year_or_years_attended: isPastStudent ? '2024' : 'Grade 10',
    delivery_method: 'pickup', // 'pickup', 'mailed', 'emailed'
    delivery_speed: 'standard', // 'standard', 'priority'
    recipient_name: '',
    recipient_address: '',
    recipient_email: user?.email || '',
    recipient_phone: user?.phone || '',
    reason: '',
    custom_request_details: '',
    release_authorized: false,
    legal_acknowledged: false,
  });

  const sigCanvas = useRef(null);

  useEffect(() => {
    if (isPastStudent) {
      setFormData(prev => ({
        ...prev,
        document_type_id: 1, // Past students can only do transcripts
        student_source: 'self',
        selected_profile_id: 'self',
        student_full_name: user?.full_name || '',
        student_bemis_id: 'STU-1000',
        student_graduation_year_or_years_attended: '2024',
      }));
    }
  }, [user, isPastStudent]);

  const availableTypes = isPastStudent
    ? DOCUMENT_TYPES.filter(d => d.name === 'transcript')
    : DOCUMENT_TYPES;

  const selectedType = DOCUMENT_TYPES.find(d => d.id === parseInt(formData.document_type_id)) || DOCUMENT_TYPES[0];
  const isCustomRequest = selectedType.name === 'custom_request';
  const basePrice = selectedType.base_price;
  const deliveryPrice = formData.delivery_method === 'mailed' ? 15 : 0;
  const speedPrice = formData.delivery_speed === 'priority' ? 25 : 0;
  const totalPrice = isCustomRequest ? 'TBD' : (basePrice + deliveryPrice + speedPrice);

  const handleSelectDocType = (id) => {
    setFormData(prev => ({
      ...prev,
      document_type_id: id
    }));
  };

  const handleProfileSelect = (profileId) => {
    if (profileId === 'custom') {
      setFormData(prev => ({
        ...prev,
        selected_profile_id: 'custom',
        student_source: 'custom',
        student_full_name: '',
        student_bemis_id: '',
        student_graduation_year_or_years_attended: '',
      }));
    } else {
      const prof = STUDENT_PROFILES.find(p => p.id === profileId);
      if (prof) {
        setFormData(prev => ({
          ...prev,
          selected_profile_id: profileId,
          student_source: 'profile',
          student_full_name: prof.name,
          student_bemis_id: prof.bemis,
          student_graduation_year_or_years_attended: prof.grade,
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const getDocIcon = (name) => {
    switch (name) {
      case 'transcript': return <FileText size={20} />;
      case 'enrollment_verification': return <CheckCircle size={20} />;
      case 'disciplinary_record': return <ShieldAlert size={20} />;
      case 'duplicate_diploma': return <GraduationCap size={20} />;
      default: return <Plus size={20} />;
    }
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      return true;
    }
    if (step === 2) {
      if (!formData.student_full_name.trim()) {
        setError('Student Full Name is required.');
        return false;
      }
      if (!formData.student_bemis_id.trim()) {
        setError('Student ID (BEMIS ID) is required.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (formData.delivery_method === 'mailed') {
        if (!formData.recipient_name.trim()) {
          setError('Recipient Name is required for mailing.');
          return false;
        }
        if (!formData.recipient_address.trim()) {
          setError('Shipping Address is required for mailing.');
          return false;
        }
      }
      if (formData.delivery_method === 'emailed') {
        if (!formData.recipient_email.trim()) {
          setError('Recipient Email Address is required.');
          return false;
        }
      }
      if (isCustomRequest && !formData.custom_request_details.trim()) {
        setError('Please describe your custom request details.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!formData.release_authorized) {
        setError('You must authorize the release of student records to proceed.');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.legal_acknowledged) {
      setError('You must acknowledge that the signature is legally binding.');
      return;
    }

    const signatureEmpty = sigCanvas.current ? sigCanvas.current.isEmpty() : true;
    if (selectedType.is_auto_generated && signatureEmpty) {
      setError('A digital signature is strictly required for this auto-generated form.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('document_type_id', formData.document_type_id);
      payload.append('student_bemis_id', formData.student_bemis_id);
      payload.append('student_full_name', formData.student_full_name);
      payload.append('student_graduation_year_or_years_attended', formData.student_graduation_year_or_years_attended);
      payload.append('delivery_method', formData.delivery_method);

      // Construct form_data fields
      const extraData = {
        reason: formData.reason,
        delivery_speed: formData.delivery_speed,
        base_fee: isCustomRequest ? 'TBD' : basePrice,
        delivery_fee: deliveryPrice,
        speed_fee: speedPrice,
        total_fee: totalPrice,
        ...(formData.delivery_method === 'mailed' && {
          recipient_name: formData.recipient_name,
          recipient_address: formData.recipient_address,
          recipient_phone: formData.recipient_phone,
        }),
        ...(formData.delivery_method === 'emailed' && {
          recipient_email: formData.recipient_email,
        }),
        ...(isCustomRequest && {
          custom_request_details: formData.custom_request_details,
        })
      };

      payload.append('form_data', JSON.stringify(extraData));

      if (sigCanvas.current && !signatureEmpty) {
        const blob = await new Promise(resolve => {
          sigCanvas.current.getTrimmedCanvas().toBlob(resolve, 'image/png');
        });
        if (blob) {
          payload.append('signature_image', blob, 'signature.png');
        }
      }

      await apiFetch('/requests/create', {
        method: 'POST',
        body: payload
      });

      // Redirect paid requests to bank-details, free to dashboard
      const hasFee = selectedType.requires_payment || deliveryPrice > 0 || speedPrice > 0;
      if (hasFee) {
        navigate('/dashboard/parents/bank-details');
      } else {
        navigate('/dashboard/parents');
      }

    } catch (err) {
      setError(err.message || 'Failed to submit the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Back button */}
      <button 
        onClick={() => {
          if (currentStep > 1) prevStep();
          else navigate('/dashboard/parents');
        }} 
        className="btn-secondary flex items-center gap-2 mb-6"
        style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}
      >
        <ArrowLeft size={16} /> {currentStep > 1 ? `Back to Step ${currentStep - 1}` : 'Back to Dashboard'}
      </button>

      {/* Stepper Progress Indicator */}
      <div className="stepper-container" style={{ margin: '0 auto 3rem auto', maxWidth: '800px' }}>
        {[
          { step: 1, label: 'Document Type' },
          { step: 2, label: 'Student Info' },
          { step: 3, label: 'Delivery & Speed' },
          { step: 4, label: 'Review Details' },
          { step: 5, label: 'Digital Signature' }
        ].map((item, idx, arr) => (
          <React.Fragment key={item.step}>
            <div className="step-item">
              <div className={`step-circle ${currentStep === item.step ? 'active' : currentStep > item.step ? 'completed' : ''}`}>
                {currentStep > item.step ? <Check size={14} /> : item.step}
              </div>
              <span className={`step-label ${currentStep === item.step ? 'active' : currentStep > item.step ? 'completed' : ''}`}>
                {item.label}
              </span>
            </div>
            {idx < arr.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          color: '#b91c1c',
          fontSize: '0.9rem',
          fontWeight: 500,
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Main Glass Panel Card */}
      <div className="mock-card" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid #eaeaea', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        {/* STEP 1: SELECT TYPE */}
        {currentStep === 1 && (
          <div className="animate-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7a0c2e', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
                Select Request Type
              </h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Please choose the type of official document you wish to request.
              </p>
            </div>

            <div className="doc-card-grid">
              {availableTypes.map((type) => {
                const isSelected = parseInt(formData.document_type_id) === type.id;
                return (
                  <div 
                    key={type.id} 
                    className={`doc-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDocType(type.id)}
                  >
                    <div>
                      <div className="doc-card-icon-wrap">
                        {getDocIcon(type.name)}
                      </div>
                      <h3 className="doc-card-title">{type.label}</h3>
                      <p className="doc-card-desc">{type.description}</p>
                    </div>

                    <div className="doc-card-footer">
                      <div>
                        <div className="doc-card-meta-label">Est. Time</div>
                        <div className="doc-card-meta-val">{type.est_time}</div>
                      </div>
                      <div className="doc-card-fee">
                        {type.name === 'custom_request' ? 'TBD' : type.base_price === 0 ? 'Free' : `$${type.base_price}`}
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#7a0c2e',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem'
                      }}>
                        <Check size={12} style={{ margin: 'auto' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
              <button 
                onClick={nextStep} 
                className="btn-primary"
                style={{ background: '#7a0c2e', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Continue to Student Info <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STUDENT INFO */}
        {currentStep === 2 && (
          <div className="animate-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7a0c2e', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
                Student Information
              </h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Select a profile from recently used students or input custom details.
              </p>
            </div>

            {isPastStudent ? (
              // Past Student view (no profiles selection)
              <div style={{
                background: '#fdf5f6',
                border: '1px solid #f6d1d8',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#7a0c2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user?.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: '#7a0c2e', fontSize: '1.1rem' }}>{user?.full_name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Past Student (Self Request)</p>
                  </div>
                </div>
              </div>
            ) : (
              // Parent View: Show child profiles selector
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '1rem' }}>
                  Recently Used Student Profiles
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {STUDENT_PROFILES.map((p) => {
                    const isSelected = formData.selected_profile_id === p.id;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => handleProfileSelect(p.id)}
                        className={`profile-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="profile-avatar-wrap" style={{ background: p.color }}>
                          <span className="profile-initials">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: '#1a1a1a' }}>{p.name}</h4>
                          <p style={{ fontSize: '0.8rem', color: '#666', margin: '2px 0 0 0' }}>{p.grade} | ID: {p.bemis}</p>
                        </div>
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#7a0c2e' }}>
                            <CheckCircle size={18} fill="#7a0c2e" color="#fff" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div 
                    onClick={() => handleProfileSelect('custom')}
                    className={`profile-card ${formData.selected_profile_id === 'custom' ? 'selected' : ''}`}
                  >
                    <div className="profile-avatar-wrap" style={{ background: '#777777' }}>
                      <span className="profile-initials"><Plus size={16} /></span>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: '#1a1a1a' }}>Custom Student</h4>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '2px 0 0 0' }}>Input new student details</p>
                    </div>
                    {formData.selected_profile_id === 'custom' && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#7a0c2e' }}>
                        <CheckCircle size={18} fill="#7a0c2e" color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Custom/Fields Inputs */}
            {(formData.selected_profile_id === 'custom' || isPastStudent) && (
              <div className="form-grid form-grid-2" style={{
                background: '#fafafa',
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>
                    Student Full Name *
                  </label>
                  <input 
                    type="text" 
                    name="student_full_name" 
                    className="form-input" 
                    placeholder="Full Legal Name" 
                    value={formData.student_full_name} 
                    onChange={handleInputChange} 
                    required 
                    style={{ background: '#ffffff', color: '#333', border: '1px solid #ccc' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>
                    Student ID (BEMIS ID) *
                  </label>
                  <input 
                    type="text" 
                    name="student_bemis_id" 
                    className="form-input" 
                    placeholder="e.g. STU-XXXX" 
                    value={formData.student_bemis_id} 
                    onChange={handleInputChange} 
                    required 
                    style={{ background: '#ffffff', color: '#333', border: '1px solid #ccc' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>
                    {isPastStudent ? 'Graduation Year' : 'Grade Level / Years Attended'}
                  </label>
                  <input 
                    type="text" 
                    name="student_graduation_year_or_years_attended" 
                    className="form-input" 
                    placeholder="e.g. Grade 10 or 2024" 
                    value={formData.student_graduation_year_or_years_attended} 
                    onChange={handleInputChange} 
                    style={{ background: '#ffffff', color: '#333', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            )}

            {formData.selected_profile_id !== 'custom' && !isPastStudent && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <UserCheck size={16} /> Selected Profile Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Name</span>
                    <strong style={{ color: '#0f172a' }}>{formData.student_full_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>BEMIS ID</span>
                    <strong style={{ color: '#0f172a' }}>{formData.student_bemis_id}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Grade / Level</span>
                    <strong style={{ color: '#0f172a' }}>{formData.student_graduation_year_or_years_attended}</strong>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
              <button 
                onClick={prevStep} 
                className="btn-secondary"
                style={{ padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem' }}
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                className="btn-primary"
                style={{ background: '#7a0c2e', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Continue to Delivery <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DELIVERY & SPEED */}
        {currentStep === 3 && (
          <div className="animate-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7a0c2e', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
                Delivery Format & Speed
              </h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Select delivery methods, processing times, and check your live cost estimate.
              </p>
            </div>

            <div className="flex-responsive" style={{ gap: '2rem' }}>
              {/* Left Column: Form Controls */}
              <div style={{ flex: '1 1 60%' }}>
                
                {/* Delivery Preference */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.75rem' }}>
                    Delivery Method *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { id: 'pickup', label: 'Office Pickup', sub: 'At School - Free', icon: <MapPin size={16} /> },
                      { id: 'emailed', label: 'Digital Copy', sub: 'Secure PDF - Free', icon: <Mail size={16} /> },
                      { id: 'mailed', label: 'Physical Mail', sub: 'Registered - +$15.00', icon: <Clock size={16} /> },
                    ].map(opt => {
                      const isSel = formData.delivery_method === opt.id;
                      return (
                        <div 
                          key={opt.id}
                          onClick={() => setFormData(prev => ({ ...prev, delivery_method: opt.id }))}
                          style={{
                            border: `1.5px solid ${isSel ? '#7a0c2e' : '#eaeaea'}`,
                            background: isSel ? 'rgba(122, 12, 46, 0.01)' : '#ffffff',
                            borderRadius: '10px',
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ color: isSel ? '#7a0c2e' : '#666', marginBottom: '0.5rem' }}>{opt.icon}</div>
                          <strong style={{ fontSize: '0.85rem', color: '#333' }}>{opt.label}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{opt.sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Fields: Mailed */}
                {formData.delivery_method === 'mailed' && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                  }} className="animate-up">
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} /> Recipient Mailing Details
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>Recipient Name / Institution *</label>
                        <input 
                          type="text" 
                          name="recipient_name" 
                          placeholder="e.g. University of Belize / Registrar" 
                          className="form-input" 
                          value={formData.recipient_name}
                          onChange={handleInputChange}
                          style={{ background: '#fff', color: '#333', border: '1px solid #ccc', padding: '0.75rem 1rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>Shipping Address *</label>
                        <textarea 
                          name="recipient_address" 
                          placeholder="Street Address, City, State, Country" 
                          className="form-input" 
                          rows="3"
                          value={formData.recipient_address}
                          onChange={handleInputChange}
                          style={{ background: '#fff', color: '#333', border: '1px solid #ccc', padding: '0.75rem 1rem', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>Recipient Phone Number</label>
                        <input 
                          type="text" 
                          name="recipient_phone" 
                          placeholder="e.g. 501-XXX-XXXX" 
                          className="form-input" 
                          value={formData.recipient_phone}
                          onChange={handleInputChange}
                          style={{ background: '#fff', color: '#333', border: '1px solid #ccc', padding: '0.75rem 1rem' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Fields: Emailed */}
                {formData.delivery_method === 'emailed' && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                  }} className="animate-up">
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={16} /> Recipient Email Address
                    </h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>Recipient Email Address *</label>
                      <input 
                        type="email" 
                        name="recipient_email" 
                        placeholder="recipient@example.com" 
                        className="form-input" 
                        value={formData.recipient_email}
                        onChange={handleInputChange}
                        style={{ background: '#fff', color: '#333', border: '1px solid #ccc', padding: '0.75rem 1rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* Processing Speed */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.75rem' }}>
                    Processing Speed *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { id: 'standard', label: 'Standard Processing', sub: '2-5 Business Days - Free' },
                      { id: 'priority', label: 'Priority Processing', sub: 'Expedited 24h - +$25.00' }
                    ].map(speed => {
                      const isSel = formData.delivery_speed === speed.id;
                      return (
                        <div 
                          key={speed.id}
                          onClick={() => setFormData(prev => ({ ...prev, delivery_speed: speed.id }))}
                          style={{
                            border: `1.5px solid ${isSel ? '#7a0c2e' : '#eaeaea'}`,
                            background: isSel ? 'rgba(122, 12, 46, 0.01)' : '#ffffff',
                            borderRadius: '10px',
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#333' }}>{speed.label}</strong>
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: '1.5px solid #ccc',
                              display: 'flex',
                              background: isSel ? '#7a0c2e' : 'transparent',
                              borderColor: isSel ? '#7a0c2e' : '#ccc'
                            }}>
                              {isSel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', margin: 'auto' }} />}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>{speed.sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reason / Custom Details Input */}
                <div style={{ marginBottom: '1rem' }}>
                  {isCustomRequest ? (
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem' }}>
                        Custom Request Details *
                      </label>
                      <textarea
                        name="custom_request_details"
                        rows="4"
                        placeholder="Please describe exactly what custom document or letter you need from the school registrar..."
                        className="form-input"
                        value={formData.custom_request_details}
                        onChange={handleInputChange}
                        style={{ background: '#fff', color: '#333', border: '1px solid #ccc', padding: '0.75rem 1rem', resize: 'vertical' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem' }}>
                        Reason for Request / Additional Notes (Optional)
                      </label>
                      <textarea
                        name="reason"
                        rows="3"
                        placeholder="e.g. Applying for university admissions, personal records, etc."
                        className="form-input"
                        value={formData.reason}
                        onChange={handleInputChange}
                        style={{ background: '#fff', color: '#333', border: '1px solid #ccc', padding: '0.75rem 1rem', resize: 'vertical' }}
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Live Order Summary Invoice Card */}
              <div style={{ flex: '1 1 40%', alignSelf: 'flex-start' }}>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  position: 'sticky',
                  top: '100px'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    Order Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>
                        {selectedType.label} (Base)
                      </span>
                      <strong style={{ color: '#334155' }}>
                        {isCustomRequest ? 'TBD' : `$${basePrice.toFixed(2)}`}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>
                        Delivery ({formData.delivery_method === 'mailed' ? 'Mail' : formData.delivery_method === 'emailed' ? 'Email' : 'Pickup'})
                      </span>
                      <strong style={{ color: '#334155' }}>
                        {deliveryPrice > 0 ? `+$${deliveryPrice.toFixed(2)}` : 'Free'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>
                        Processing Speed ({formData.delivery_speed === 'priority' ? 'Priority' : 'Standard'})
                      </span>
                      <strong style={{ color: '#334155' }}>
                        {speedPrice > 0 ? `+$${speedPrice.toFixed(2)}` : 'Free'}
                      </strong>
                    </div>

                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Total Fee Estimate</span>
                      <strong style={{ color: '#7a0c2e', fontSize: '1.3rem', fontFamily: 'Georgia, serif' }}>
                        {totalPrice === 'TBD' ? 'TBD' : `$${totalPrice.toFixed(2)}`}
                      </strong>
                    </div>
                  </div>

                  {/* Payment notice helper */}
                  {selectedType.requires_payment && (
                    <div style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginTop: '1.25rem',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      fontSize: '0.78rem',
                      color: '#d97706',
                      lineHeight: 1.4
                    }}>
                      <strong>Payment Required:</strong> After submitting, you must upload your bank transfer receipt in the Payments tab to activate processing.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                onClick={prevStep} 
                className="btn-secondary"
                style={{ padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem' }}
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                className="btn-primary"
                style={{ background: '#7a0c2e', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Continue to Review <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW DETAILS */}
        {currentStep === 4 && (
          <div className="animate-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7a0c2e', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
                Review Request Details
              </h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Verify all information before providing authorization and final signature.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Grouped Information Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* Student Profile Info */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    Student Information
                  </h4>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', padding: '6px 0' }}>Full Name:</td>
                        <td style={{ fontWeight: 600, color: '#333', textAlign: 'right' }}>{formData.student_full_name}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '6px 0' }}>BEMIS ID:</td>
                        <td style={{ fontWeight: 600, color: '#333', textAlign: 'right' }}>{formData.student_bemis_id}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '6px 0' }}>Grade/Graduation:</td>
                        <td style={{ fontWeight: 600, color: '#333', textAlign: 'right' }}>{formData.student_graduation_year_or_years_attended || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Delivery Information */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    Delivery & Delivery Details
                  </h4>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', padding: '6px 0' }}>Method:</td>
                        <td style={{ fontWeight: 600, color: '#333', textAlign: 'right', textTransform: 'capitalize' }}>
                          {formData.delivery_method === 'pickup' ? 'Office Pickup' : formData.delivery_method === 'mailed' ? 'Registered Mail' : 'Secure Email PDF'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '6px 0' }}>Processing:</td>
                        <td style={{ fontWeight: 600, color: '#333', textAlign: 'right', textTransform: 'capitalize' }}>
                          {formData.delivery_speed === 'priority' ? 'Priority (24h)' : 'Standard (2-5 days)'}
                        </td>
                      </tr>
                      {formData.delivery_method === 'mailed' && (
                        <>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Recipient:</td>
                            <td style={{ fontWeight: 600, color: '#333', textAlign: 'right' }}>{formData.recipient_name}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Destination:</td>
                            <td style={{ fontWeight: 600, color: '#333', textAlign: 'right', fontSize: '0.8rem' }}>{formData.recipient_address}</td>
                          </tr>
                        </>
                      )}
                      {formData.delivery_method === 'emailed' && (
                        <tr>
                          <td style={{ color: '#64748b', padding: '6px 0' }}>Send to:</td>
                          <td style={{ fontWeight: 600, color: '#333', textAlign: 'right' }}>{formData.recipient_email}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Invoice Breakdown Table */}
              <div style={{ background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '1rem' }}>
                  Invoice breakdown
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                        <th style={{ padding: '0.75rem 0.5rem', color: '#666', fontWeight: 600 }}>Item Description</th>
                        <th style={{ padding: '0.75rem 0.5rem', color: '#666', fontWeight: 600, textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#333' }}>
                          <strong>{selectedType.label}</strong> base request fee
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#333', textAlign: 'right', fontWeight: 600 }}>
                          {isCustomRequest ? 'TBD' : `$${basePrice.toFixed(2)}`}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#333' }}>
                          Delivery Method Fee ({formData.delivery_method === 'mailed' ? 'Physical Registered Mail' : 'Digital/Pickup'})
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#333', textAlign: 'right', fontWeight: 600 }}>
                          {deliveryPrice > 0 ? `$${deliveryPrice.toFixed(2)}` : '$0.00'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#333' }}>
                          Processing Speed Fee ({formData.delivery_speed === 'priority' ? 'Expedited Priority' : 'Standard Speed'})
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#333', textAlign: 'right', fontWeight: 600 }}>
                          {speedPrice > 0 ? `$${speedPrice.toFixed(2)}` : '$0.00'}
                        </td>
                      </tr>
                      <tr style={{ background: '#fcfcfc' }}>
                        <td style={{ padding: '1rem 0.5rem', color: '#0f172a', fontWeight: 700 }}>Total Fee</td>
                        <td style={{ padding: '1rem 0.5rem', color: '#7a0c2e', textAlign: 'right', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Georgia, serif' }}>
                          {totalPrice === 'TBD' ? 'TBD' : `$${totalPrice.toFixed(2)}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Release Authorization Checkbox */}
              <div style={{
                background: '#fdf5f6',
                border: '1px solid #f6d1d8',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <input 
                  type="checkbox" 
                  id="release_authorized" 
                  name="release_authorized"
                  checked={formData.release_authorized}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: '#7a0c2e', cursor: 'pointer' }}
                />
                <label htmlFor="release_authorized" style={{ fontSize: '0.88rem', color: '#333', cursor: 'pointer', lineHeight: 1.5, fontWeight: 500 }}>
                  <strong>Legal Authorization:</strong> I hereby authorize Bishop Martin High School to release the academic and administrative records of the student named above to the designated delivery address or recipient email listed in this request form. *
                </label>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                onClick={prevStep} 
                className="btn-secondary"
                style={{ padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem' }}
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                className="btn-primary"
                style={{ background: '#7a0c2e', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Continue to Signature <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DIGITAL SIGNATURE */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmit} className="animate-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7a0c2e', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
                Digital Signature
              </h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Draw your signature on the pad below to finalize and submit your application.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Legal acknowledgement */}
              <div style={{
                background: '#fafafa',
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                padding: '1.5rem',
              }}>
                <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  <strong>Digital Signature Agreement:</strong> Under the Electronic Transactions Act, drawing your signature on this pad constitutes a legally binding electronic signature. By signing, you confirm that you are the authorized parent, legal guardian, or the student/past student themselves, and that all details provided in this document request are true, accurate, and complete.
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="legal_acknowledged" 
                    name="legal_acknowledged"
                    checked={formData.legal_acknowledged}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#7a0c2e', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="legal_acknowledged" style={{ fontSize: '0.85rem', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                    I agree that this digital signature is legally binding and equivalent to a handwritten signature. *
                  </label>
                </div>
              </div>

              {/* Signature Board canvas container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333' }}>
                  Draw Signature Here {selectedType.is_auto_generated && '*'}
                </label>
                <div className="signature-board-wrap">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="#7a0c2e"
                    canvasProps={{ 
                      className: 'signature-canvas', 
                      style: { width: '100%', height: '260px', background: '#fbfcfd' } 
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={clearSignature} 
                    className="signature-clear-btn"
                  >
                    <Trash2 size={13} /> Clear / Reset Pad
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '4px' }}>
                  Draw with your mouse, trackpad, or finger on touch screens. Ensure the signature is clear and readable.
                </p>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                type="button"
                onClick={prevStep} 
                className="btn-secondary"
                style={{ padding: '0.8rem 2rem', borderRadius: '6px', fontSize: '0.9rem' }}
                disabled={loading}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ background: '#7a0c2e', color: '#fff', padding: '0.8rem 2.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="db-loading-spinner" style={{ borderTopColor: '#fff', width: '14px', height: '14px', marginRight: '6px' }} />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <PenTool size={16} /> Sign & Execute Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default NewRequest;
