import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X,
  Mail, 
  MapPin, 
  Clock, 
  UserCheck, 
  PenTool, 
  Trash2,
  Bell,
  Settings,
  ShieldAlert,
  FileText,
  CheckCircle,
  Sparkles,
  Award
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const DOCUMENT_TYPES = [
  { id: 1, name: 'transcript', label: 'Official Transcript', is_auto_generated: false, requires_payment: true, est_time: '3-5 Business Days', description: "Certified copy of student's academic record, sealed for official use by institutions or employers." },
  { id: 2, name: 'enrollment_verification', label: 'Enrollment Verification', is_auto_generated: true, requires_payment: false, est_time: '1-2 Business Days', description: 'Official letter verifying current or past enrollment status for insurance, housing, or employers.' },
  { id: 3, name: 'disciplinary_record', label: 'Disciplinary Record', is_auto_generated: true, requires_payment: false, est_time: '3-5 Business Days', description: 'Summary of disciplinary history, typically requested for college admissions or transfers.' },
  { id: 4, name: 'duplicate_diploma', label: 'Duplicate Diploma', is_auto_generated: false, requires_payment: true, est_time: '2-4 Weeks', description: 'Replacement copy of a previously issued graduation diploma.' },
  { id: 5, name: 'custom_request', label: 'Custom Request', is_auto_generated: false, requires_payment: true, est_time: 'Varies', description: 'Specific letters or forms not covered by standard options. Subject to administrative review.' },
];

const STUDENT_PROFILES = [
  { id: 'eleanor', name: 'Eleanor Vance', bemis: 'STU-9824', grade: 'Grade 10', dob: 'October 14, 2006' },
  { id: 'theodore', name: 'Theodore Hayes', bemis: 'STU-7511', grade: 'Grade 8', dob: 'May 22, 2008' },
];

const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPastStudent = user?.user_type === 'past_student' || user?.type === 'past_student';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    document_type_id: 1, // Default to transcript (ID 1)
    student_source: isPastStudent ? 'self' : 'profile', // 'profile', 'custom', or 'self'
    selected_profile_id: isPastStudent ? 'self' : 'eleanor', // 'eleanor', 'theodore', 'custom', or 'self'
    student_first_name: '',
    student_last_name: '',
    student_full_name: isPastStudent ? user?.full_name || '' : 'Eleanor Vance',
    student_bemis_id: isPastStudent ? 'STU-1000' : 'STU-9824',
    student_graduation_year_or_years_attended: isPastStudent ? '2024' : 'Grade 10',
    delivery_method: 'pickup', // 'pickup', 'mailed', 'emailed'
    delivery_speed: 'standard', // 'standard', 'priority'
    recipient_name: 'University of Cambridge - Admissions Office',
    recipient_address: 'The Old Schools, Trinity Lane, Cambridge CB2 1TN, United Kingdom',
    recipient_email: 'admissions@cam.ac.uk',
    recipient_phone: '',
    student_reference_number: 'UCAS-9982-11A',
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
        document_type_id: 1,
        student_source: 'self',
        selected_profile_id: 'self',
        student_full_name: user?.full_name || '',
        student_bemis_id: 'STU-1000',
        student_graduation_year_or_years_attended: '2024',
      }));
    }
  }, [user, isPastStudent]);

  const selectedType = DOCUMENT_TYPES.find(d => d.id === parseInt(formData.document_type_id)) || DOCUMENT_TYPES[0];
  const isCustomRequest = selectedType.name === 'custom_request';

  // Fee calculation matching screenshots exactly:
  // - Step 3 digital copy base is $10.00, processing fee is $1.50, total is $11.50.
  // - Step 4 physical mail transcript is $15.00 base, expedited is $25.00, secure mail shipping is $45.00, total is $85.00.
  const getFees = () => {
    const isTranscript = selectedType.name === 'transcript';
    const isDiploma = selectedType.name === 'duplicate_diploma';
    
    let base = selectedType.requires_payment ? (isDiploma ? 35 : (formData.delivery_method === 'mailed' ? 15 : 10)) : 0;
    let shipping = formData.delivery_method === 'mailed' ? (isTranscript ? 45 : 15) : 0;
    let speed = formData.delivery_speed === 'priority' ? 25 : 0;
    let processingFee = (formData.delivery_method !== 'mailed' && selectedType.requires_payment) ? 1.50 : 0;

    let total = base + shipping + speed + processingFee;
    if (selectedType.name === 'custom_request') {
      return { base: 'TBD', shipping: 0, speed: 0, processingFee: 0, total: 'TBD' };
    }

    return { base, shipping, speed, processingFee, total };
  };

  const fees = getFees();

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
        student_graduation_year_or_years_attended: 'Grade 9',
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
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      if (name === 'student_first_name' || name === 'student_last_name') {
        updated.student_full_name = `${updated.student_first_name} ${updated.student_last_name}`.trim();
      }
      return updated;
    });
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const getDocIcon = (name) => {
    switch (name) {
      case 'transcript': return <FileText size={20} color="#7a0c2e" />;
      case 'enrollment_verification': return <UserCheck size={20} color="#7a0c2e" />;
      case 'disciplinary_record': return <ShieldAlert size={20} color="#7a0c2e" />;
      case 'duplicate_diploma': return <Award size={20} color="#7a0c2e" />;
      default: return <PenTool size={20} color="#7a0c2e" />;
    }
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      return true;
    }
    if (step === 2) {
      if (formData.selected_profile_id === 'custom') {
        if (!formData.student_first_name.trim() || !formData.student_last_name.trim()) {
          setError('First and Last name are required.');
          return false;
        }
      } else if (!formData.student_full_name.trim()) {
        setError('Please select or input student name.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (formData.delivery_method === 'mailed') {
        if (!formData.recipient_name.trim()) {
          setError('Recipient Name is required.');
          return false;
        }
        if (!formData.recipient_address.trim()) {
          setError('Shipping Address is required.');
          return false;
        }
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
      setError('You must accept the terms of the Legal Acknowledgement.');
      return;
    }

    const signatureEmpty = sigCanvas.current ? sigCanvas.current.isEmpty() : true;
    if (signatureEmpty) {
      setError('A digital signature is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('document_type_id', formData.document_type_id);
      payload.append('student_bemis_id', formData.student_bemis_id || 'HA-2023-8472');
      payload.append('student_full_name', formData.student_full_name);
      payload.append('student_graduation_year_or_years_attended', formData.student_graduation_year_or_years_attended);
      payload.append('delivery_method', formData.delivery_method);

      const extraData = {
        reason: formData.reason,
        delivery_speed: formData.delivery_speed,
        base_fee: fees.base,
        delivery_fee: fees.shipping,
        speed_fee: fees.speed,
        total_fee: fees.total,
        student_reference_number: formData.student_reference_number,
        recipient_name: formData.recipient_name,
        recipient_address: formData.recipient_address,
        recipient_email: formData.recipient_email,
        recipient_phone: formData.recipient_phone,
        custom_request_details: formData.custom_request_details,
      };

      payload.append('form_data', JSON.stringify(extraData));

      if (sigCanvas.current && !signatureEmpty) {
        const blob = await new Promise(resolve => {
          sigCanvas.current.getCanvas().toBlob(resolve, 'image/png');
        });
        if (blob) {
          payload.append('signature_image', blob, 'signature.png');
        }
      }

      await apiFetch('/requests/create', {
        method: 'POST',
        body: payload
      });

      setIsSubmitted(true);

    } catch (err) {
      setError(err.message || 'Failed to submit the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    const isFree = !selectedType.requires_payment && fees.shipping === 0 && fees.speed === 0;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: '#faf9f6',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#e8f5e9',
          border: '1.5px solid #a5d6a7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2e7d32',
          marginBottom: '1.5rem',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <Check size={28} strokeWidth={3} />
        </div>

        {/* Title & Subtitle */}
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#5c0922', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem 0' }}>
          Request Submitted
        </h1>
        <p style={{ color: '#666663', fontSize: '0.95rem', margin: '0 0 2rem 0', maxWidth: '480px', lineHeight: 1.5 }}>
          Your document request has been successfully received by the administration office.
        </p>

        {/* Summary Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #eaeaea',
          borderLeft: '4px solid #cca43b',
          borderRadius: '8px',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '480px',
          boxSizing: 'border-box',
          textAlign: 'left',
          marginBottom: '2.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
        }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666663', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>
            REQUEST SUMMARY
          </h4>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, background: '#fafafa', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888885', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Request ID</span>
              <strong style={{ color: '#1a1a1a', fontSize: '0.9rem' }}>REQ-2023-084</strong>
            </div>
            <div style={{ flex: 1, background: '#fafafa', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888885', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Document Type</span>
              <strong style={{ color: '#1a1a1a', fontSize: '0.9rem' }}>{selectedType.label}</strong>
            </div>
          </div>

          <div style={{ background: '#fafafa', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#cca43b" />
            <div>
              <span style={{ color: '#888885', fontSize: '0.72rem', display: 'block' }}>Estimated Processing Time</span>
              <strong style={{ color: '#1a1a1a', fontSize: '0.9rem' }}>3-5 Business Days</strong>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '480px' }}>
          <button 
            type="button"
            onClick={() => navigate('/dashboard/parents')}
            style={{
              flex: 1,
              background: '#7a0c2e',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Return to Dashboard <ArrowRight size={14} />
          </button>
          <button 
            type="button"
            onClick={() => navigate(isFree ? '/dashboard/parents' : '/dashboard/parents/bank-details')}
            style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #dcdad5',
              color: '#4a4743',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            View Request Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', paddingBottom: '3rem' }}>
      
      {/* HEADER SECTION (Visible for steps 2, 3, 4, 5) */}
      {currentStep > 1 && (
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #eaeaea',
          padding: '0.8rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          boxSizing: 'border-box'
        }}>
          {/* Logo */}
          <Link to="/dashboard/parents" style={{ textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7a0c2e', fontFamily: 'Georgia, serif', margin: 0 }}>
              Heritage Academy Parent Portal
            </h2>
          </Link>

          {/* Stepper Progress (Only for Step 2) */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e8f5e9', border: '1px solid #a5d6a7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ color: '#666', fontWeight: 500 }}>Request Type</span>
              </div>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#e0e0e0', marginTop: '-12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7a0c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold' }}>
                  2
                </div>
                <span style={{ color: '#7a0c2e', fontWeight: 700 }}>Student Info</span>
              </div>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#e0e0e0', marginTop: '-12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  3
                </div>
                <span style={{ color: '#888' }}>Details</span>
              </div>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#e0e0e0', marginTop: '-12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  4
                </div>
                <span style={{ color: '#888' }}>Review</span>
              </div>
            </div>
          )}

          {/* Navigation Links & Profile (For steps 3, 4, 5) */}
          {currentStep >= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                <Link to="/dashboard/parents" style={{ color: '#7a0c2e', textDecoration: 'none', borderBottom: '2px solid #7a0c2e', paddingBottom: '4px' }}>Documents</Link>
                <Link to="/dashboard/parents/records" style={{ color: '#666666', textDecoration: 'none' }}>Records</Link>
                <Link to="/dashboard/parents/bank-details" style={{ color: '#666666', textDecoration: 'none' }}>Payments</Link>
                <Link to="/help" style={{ color: '#666666', textDecoration: 'none' }}>Support</Link>
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><Bell size={18} /></button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><Settings size={18} /></button>
                <Link to="/dashboard/parents/new" style={{
                  background: '#7a0c2e',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Upload Form
                </Link>
                <img 
                  src="/principal_avatar.png" 
                  alt="User" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100";
                  }}
                />
              </div>
            </div>
          )}

          {/* Close button in Step 2 */}
          {currentStep === 2 && (
            <button 
              onClick={() => navigate('/dashboard/parents')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555555', display: 'flex', alignItems: 'center' }}
            >
              <X size={20} />
            </button>
          )}
        </header>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* STEP 1: SELECT TYPE */}
        {currentStep === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', marginTop: '1.5rem' }}>
              <div>
                <button 
                  onClick={() => navigate('/dashboard/parents')} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#7a0c2e', fontSize: '0.85rem', fontWeight: 600, padding: 0, marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}
                >
                  <ArrowLeft size={14} /> Back to Documents
                </button>
                <h1 style={{ fontSize: '2.1rem', fontWeight: 'bold', color: '#5c0922', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem 0' }}>
                  New Document Request
                </h1>
                <p style={{ color: '#666', fontSize: '0.95rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  Please select the type of document you need to request. Processing times and fees vary by document type.
                </p>
              </div>

              {/* Progress circles for step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7a0c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold' }}>
                    1
                  </div>
                  <span style={{ color: '#7a0c2e', fontWeight: 700 }}>Select Type</span>
                </div>
                <div style={{ width: '30px', height: '1px', backgroundColor: '#ccc', marginTop: '-12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    2
                  </div>
                  <span style={{ color: '#888' }}>Details</span>
                </div>
                <div style={{ width: '30px', height: '1px', backgroundColor: '#ccc', marginTop: '-12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    3
                  </div>
                  <span style={{ color: '#888' }}>Review</span>
                </div>
              </div>
            </div>

            {/* Document Types Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {DOCUMENT_TYPES.map((type) => {
                const isSelected = parseInt(formData.document_type_id) === type.id;
                return (
                  <div 
                    key={type.id} 
                    onClick={() => handleSelectDocType(type.id)}
                    style={{
                      background: '#ffffff',
                      border: `1.5px solid ${isSelected ? '#7a0c2e' : '#eaeaea'}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '220px',
                      boxSizing: 'border-box',
                      boxShadow: isSelected ? '0 4px 12px rgba(122, 12, 46, 0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>
                      {/* Icon */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        border: '1px solid #eaeaea'
                      }}>
                        {getDocIcon(type.name)}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif' }}>
                        {type.label}
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: '#666', lineHeight: 1.4, margin: '0 0 1rem 0', fontFamily: "'Inter', sans-serif" }}>
                        {type.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#f0f0f0', margin: '0.75rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                        <div>
                          <div style={{ color: '#aaaaaa', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>PROCESSING TIME</div>
                          <div style={{ color: '#333333', fontWeight: 500 }}>{type.est_time}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#aaaaaa', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>FEE</div>
                          <div style={{ color: '#5c0922', fontWeight: 'bold', fontSize: '1.15rem', fontFamily: 'Georgia, serif' }}>
                            {type.name === 'custom_request' ? 'TBD' : type.requires_payment ? `$${type.id === 1 ? '15.00' : '35.00'}` : 'Free'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                onClick={() => navigate('/dashboard/parents')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #7a0c2e',
                  color: '#7a0c2e',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={nextStep}
                style={{
                  background: '#7a0c2e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Next Step <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STUDENT INFO */}
        {currentStep === 2 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#111111', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem 0' }}>
                Student Information
              </h1>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Please select a recently used student profile or enter new student details for this request.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {/* Left Column: Profiles */}
              <div style={{ flex: '1 1 450px' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontFamily: "'Inter', sans-serif" }}>
                  RECENTLY USED PROFILES
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  {/* Eleanor Vance Card */}
                  <div 
                    onClick={() => handleProfileSelect('eleanor')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eaeaea',
                      borderLeft: `4px solid ${formData.selected_profile_id === 'eleanor' ? '#7a0c2e' : 'transparent'}`,
                      borderRadius: '8px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img 
                        src="/eleanor_avatar.png" 
                        alt="Eleanor Vance" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100";
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1a1a1a', margin: 0, fontFamily: 'Georgia, serif' }}>Eleanor Vance</h4>
                        <p style={{ fontSize: '0.78rem', color: '#888888', margin: '3px 0 0 0', fontFamily: "'Inter', sans-serif" }}>Grade 10 • ID: STU-9824</p>
                      </div>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '1.5px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: formData.selected_profile_id === 'eleanor' ? '#7a0c2e' : 'transparent',
                      borderColor: formData.selected_profile_id === 'eleanor' ? '#7a0c2e' : '#ccc'
                    }}>
                      {formData.selected_profile_id === 'eleanor' && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Theodore Hayes Card */}
                  <div 
                    onClick={() => handleProfileSelect('theodore')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eaeaea',
                      borderLeft: `4px solid ${formData.selected_profile_id === 'theodore' ? '#7a0c2e' : 'transparent'}`,
                      borderRadius: '8px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#d0e1fd',
                        color: '#1e4a8a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        TH
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1a1a1a', margin: 0, fontFamily: 'Georgia, serif' }}>Theodore Hayes</h4>
                        <p style={{ fontSize: '0.78rem', color: '#888888', margin: '3px 0 0 0', fontFamily: "'Inter', sans-serif" }}>Grade 8 • ID: STU-7511</p>
                      </div>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '1.5px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: formData.selected_profile_id === 'theodore' ? '#7a0c2e' : 'transparent',
                      borderColor: formData.selected_profile_id === 'theodore' ? '#7a0c2e' : '#ccc'
                    }}>
                      {formData.selected_profile_id === 'theodore' && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Enter New Details Form */}
              <div style={{ flex: '1 1 400px' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                    <FileText size={16} color="#7a0c2e" />
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#333333', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                      ENTER NEW DETAILS
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: '#555', fontWeight: 600, marginBottom: '4px' }}>First Name *</label>
                        <input 
                          type="text" 
                          name="student_first_name" 
                          placeholder="e.g. Jane"
                          value={formData.student_first_name}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e2e5', borderRadius: '6px', boxSizing: 'border-box', background: '#fafafa' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: '#555', fontWeight: 600, marginBottom: '4px' }}>Last Name *</label>
                        <input 
                          type="text" 
                          name="student_last_name" 
                          placeholder="e.g. Doe"
                          value={formData.student_last_name}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e2e5', borderRadius: '6px', boxSizing: 'border-box', background: '#fafafa' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#555', fontWeight: 600, marginBottom: '4px' }}>Student ID (Optional)</label>
                      <input 
                        type="text" 
                        name="student_bemis_id" 
                        placeholder="e.g. STU-1234"
                        value={formData.student_bemis_id}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e2e5', borderRadius: '6px', boxSizing: 'border-box', background: '#fafafa' }} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#555', fontWeight: 600, marginBottom: '4px' }}>Current Grade Level *</label>
                      <select 
                        name="student_graduation_year_or_years_attended"
                        value={formData.student_graduation_year_or_years_attended}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e2e5', borderRadius: '6px', boxSizing: 'border-box', background: '#fafafa' }}
                      >
                        <option value="">Select grade level</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>

                    <p style={{ color: '#888888', fontSize: '0.72rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      Leave blank if unknown; we will verify using name and DOB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <div style={{ color: '#cc0000', fontSize: '0.85rem', marginTop: '1.5rem', fontWeight: 500 }}>{error}</div>}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                onClick={prevStep}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cccccc',
                  color: '#555555',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button 
                onClick={nextStep}
                style={{
                  background: '#7a0c2e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DELIVERY & SPEED */}
        {currentStep === 3 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <button 
                onClick={prevStep} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#7a0c2e', fontSize: '0.85rem', fontWeight: 600, padding: 0, marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}
              >
                <ArrowLeft size={14} /> Back to Selection
              </button>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 'bold', color: '#5c0922', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem 0' }}>
                Delivery & Speed
              </h1>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Step 3 of 4: Choose how you would like your documents delivered and how quickly they need to be processed.
              </p>
            </div>

            {/* Stepper circles inside content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.75rem' }}>1</div>
              <div style={{ width: '40px', height: '1.5px', backgroundColor: '#eaeaea' }} />
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.75rem' }}>2</div>
              <div style={{ width: '40px', height: '1.5px', backgroundColor: '#7a0c2e' }} />
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7a0c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>3</div>
              <div style={{ width: '40px', height: '1.5px', backgroundColor: '#eaeaea' }} />
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.75rem' }}>4</div>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Left Column: Form Controls */}
              <div style={{ flex: '1 1 550px' }}>
                
                {/* Section 1: Delivery Format */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <MapPin size={18} color="#cca43b" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#5c0922', margin: 0, fontFamily: 'Georgia, serif' }}>
                      Delivery Format
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Digital PDF Option */}
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'emailed' }))}
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${formData.delivery_method === 'emailed' ? '#7a0c2e' : '#eaeaea'}`,
                        borderRadius: '8px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        boxSizing: 'border-box',
                        position: 'relative'
                      }}
                    >
                      <FileText size={20} color="#7a0c2e" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1a1a1a', marginBottom: '4px' }}>Digital Copy (PDF)</strong>
                        <span style={{ color: '#666', display: 'block', lineHeight: 1.4, marginBottom: '8px' }}>
                          Secure digital download link sent via email. Certified digitally for official use.
                        </span>
                        <strong style={{ color: '#1a1a1a', fontSize: '0.85rem' }}>+$0.00</strong>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '1.5px solid #ccc',
                        display: 'flex',
                        background: formData.delivery_method === 'emailed' ? '#7a0c2e' : 'transparent',
                        borderColor: formData.delivery_method === 'emailed' ? '#7a0c2e' : '#ccc'
                      }}>
                        {formData.delivery_method === 'emailed' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', margin: 'auto' }} />}
                      </div>
                    </div>

                    {/* Mailed Option */}
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'mailed' }))}
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${formData.delivery_method === 'mailed' ? '#7a0c2e' : '#eaeaea'}`,
                        borderRadius: '8px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        boxSizing: 'border-box',
                        position: 'relative'
                      }}
                    >
                      <Mail size={20} color="#7a0c2e" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1a1a1a', marginBottom: '4px' }}>Physical Copy (Mailed)</strong>
                        <span style={{ color: '#666', display: 'block', lineHeight: 1.4, marginBottom: '8px' }}>
                          Official sealed transcript printed on security paper and mailed via USPS.
                        </span>
                        <strong style={{ color: '#1a1a1a', fontSize: '0.85rem' }}>+$15.00</strong>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '1.5px solid #ccc',
                        display: 'flex',
                        background: formData.delivery_method === 'mailed' ? '#7a0c2e' : 'transparent',
                        borderColor: formData.delivery_method === 'mailed' ? '#7a0c2e' : '#ccc'
                      }}>
                        {formData.delivery_method === 'mailed' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', margin: 'auto' }} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Processing Speed */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Clock size={18} color="#cca43b" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#5c0922', margin: 0, fontFamily: 'Georgia, serif' }}>
                      Processing Speed
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Standard Speed */}
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, delivery_speed: 'standard' }))}
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${formData.delivery_speed === 'standard' ? '#7a0c2e' : '#eaeaea'}`,
                        borderRadius: '8px',
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxSizing: 'border-box',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>Standard Processing</strong>
                            <span style={{ fontSize: '0.65rem', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', color: '#666', fontWeight: 600 }}>3-5 Days</span>
                          </div>
                          <span style={{ color: '#666', marginTop: '4px' }}>Your request will be processed in the order it was received.</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>+$0.00</strong>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: '1.5px solid #ccc',
                          display: 'flex',
                          background: formData.delivery_speed === 'standard' ? '#7a0c2e' : 'transparent',
                          borderColor: formData.delivery_speed === 'standard' ? '#7a0c2e' : '#ccc'
                        }}>
                          {formData.delivery_speed === 'standard' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', margin: 'auto' }} />}
                        </div>
                      </div>
                    </div>

                    {/* Priority Speed */}
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, delivery_speed: 'priority' }))}
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${formData.delivery_speed === 'priority' ? '#7a0c2e' : '#eaeaea'}`,
                        borderRadius: '8px',
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxSizing: 'border-box',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>Priority Processing</strong>
                            <span style={{ fontSize: '0.65rem', background: '#fff9c4', padding: '2px 6px', borderRadius: '4px', color: '#fbc02d', fontWeight: 600 }}>24 Hours</span>
                          </div>
                          <span style={{ color: '#666', marginTop: '4px' }}>Expedited processing for urgent requests. Pushed to the front of the queue.</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>+$25.00</strong>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: '1.5px solid #ccc',
                          display: 'flex',
                          background: formData.delivery_speed === 'priority' ? '#7a0c2e' : 'transparent',
                          borderColor: formData.delivery_speed === 'priority' ? '#7a0c2e' : '#ccc'
                        }}>
                          {formData.delivery_speed === 'priority' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', margin: 'auto' }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Order Summary Card */}
              <div style={{ flex: '1 1 350px', position: 'sticky', top: '2rem' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.01)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5c0922', borderBottom: '1.5px solid #f0f0f0', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontFamily: 'Georgia, serif' }}>
                    Order Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#1a1a1a' }}>{selectedType.label}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#888888' }}>Qty: 1 • Student: {formData.student_full_name}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: '#333333' }}>
                        {selectedType.name === 'custom_request' ? 'TBD' : `$${fees.base.toFixed(2)}`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666666' }}>
                        Delivery: {formData.delivery_method === 'mailed' ? 'Physical Mail' : formData.delivery_method === 'emailed' ? 'Digital Copy' : 'Pickup'}
                      </span>
                      <span style={{ fontWeight: 600, color: '#333333' }}>
                        {fees.shipping > 0 ? `+$${fees.shipping.toFixed(2)}` : '$0.00'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666666' }}>
                        Speed: {formData.delivery_speed === 'priority' ? 'Priority Processing' : 'Standard Speed'}
                      </span>
                      <span style={{ fontWeight: 600, color: '#333333' }}>
                        {fees.speed > 0 ? `+$${fees.speed.toFixed(2)}` : '$0.00'}
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#f0f0f0', margin: '0.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#444' }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 600 }}>
                        {fees.total === 'TBD' ? 'TBD' : `$${(fees.total - fees.processingFee).toFixed(2)}`}
                      </span>
                    </div>

                    {fees.processingFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#444' }}>
                        <span>Processing Fee</span>
                        <span style={{ fontWeight: 600 }}>
                          {`+$${fees.processingFee.toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#f0f0f0', margin: '0.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      <span style={{ color: '#1a1a1a' }}>Total</span>
                      <span style={{ color: '#7a0c2e', fontSize: '1.4rem', fontFamily: 'Georgia, serif' }}>
                        {fees.total === 'TBD' ? 'TBD' : `$${fees.total.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Security note box */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#e8f0fe',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      color: '#1a73e8',
                      fontSize: '0.72rem',
                      lineHeight: 1.4,
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>i</div>
                      <span>Payment will be collected securely on the final step.</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                onClick={prevStep}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cccccc',
                  color: '#555555',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={nextStep}
                style={{
                  background: '#7a0c2e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW REQUEST DETAILS */}
        {currentStep === 4 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>
                Documents &gt; New Request &gt; Step 4: Review & Submit
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 'bold', color: '#5c0922', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem 0' }}>
                Review Request Details
              </h1>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Please review all information carefully before finalizing your official document request.
              </p>
            </div>

            {/* Stepper circles inside content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e8f5e9', border: '1px solid #a5d6a7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ color: '#666' }}>Student Info</span>
              </div>
              <div style={{ width: '50px', height: '1.5px', backgroundColor: '#a5d6a7' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e8f5e9', border: '1px solid #a5d6a7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ color: '#666' }}>Document Type</span>
              </div>
              <div style={{ width: '50px', height: '1.5px', backgroundColor: '#a5d6a7' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e8f5e9', border: '1px solid #a5d6a7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ color: '#666' }}>Recipient Details</span>
              </div>
              <div style={{ width: '50px', height: '1.5px', backgroundColor: '#7a0c2e' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7a0c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  4
                </div>
                <span style={{ color: '#7a0c2e', fontWeight: 700 }}>Review & Submit</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Left Column: Information Cards */}
              <div style={{ flex: '1 1 550px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Student Information Review */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => setCurrentStep(2)}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#7a0c2e', display: 'flex', alignItems: 'center' }}
                  >
                    <PenTool size={16} />
                  </button>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5c0922', margin: '0 0 1.25rem 0', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Student Information
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>STUDENT NAME</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>{formData.student_full_name}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>STUDENT ID</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>{formData.student_bemis_id || 'HA-2023-8472'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>CURRENT GRADE LEVEL</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>{formData.student_graduation_year_or_years_attended || '11th Grade (Junior)'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>DATE OF BIRTH</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>October 14, 2006</div>
                    </div>
                  </div>
                </div>

                {/* Recipient Details Review */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#7a0c2e', display: 'flex', alignItems: 'center' }}
                  >
                    <PenTool size={16} />
                  </button>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5c0922', margin: '0 0 1.25rem 0', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Recipient Details
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>INSTITUTION / ORGANIZATION NAME</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>{formData.recipient_name}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>MAILING ADDRESS</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1.4 }}>{formData.recipient_address}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div>
                        <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>RECIPIENT CONTACT (OPTIONAL)</div>
                        <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>{formData.recipient_email}</div>
                      </div>
                      <div>
                        <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>STUDENT REFERENCE NUMBER</div>
                        <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>{formData.student_reference_number}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Summaries & Payments */}
              <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Document details card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => setCurrentStep(1)}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#7a0c2e', display: 'flex', alignItems: 'center' }}
                  >
                    <PenTool size={16} />
                  </button>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5c0922', margin: '0 0 1.25rem 0', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Document
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>REQUESTED TYPE</div>
                      <span style={{
                        display: 'inline-block',
                        background: '#fff9c4',
                        color: '#f57f17',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        marginTop: '2px'
                      }}>
                        {selectedType.label}
                      </span>
                    </div>

                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>DELIVERY METHOD</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                        <MapPin size={16} /> 
                        <span>
                          {formData.delivery_method === 'mailed' ? 'Secure Physical Mail' : formData.delivery_method === 'emailed' ? 'Secure Email PDF' : 'Office Pickup'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888888', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>PROCESSING PRIORITY</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                        <Clock size={16} /> 
                        <span>
                          {formData.delivery_speed === 'priority' ? 'Expedited (24-48 hrs)' : 'Standard (3-5 Days)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxSizing: 'border-box'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5c0922', margin: '0 0 1.25rem 0', fontFamily: 'Georgia, serif' }}>
                    Payment Breakdown
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666666' }}>Official Transcript Base Fee</span>
                      <span style={{ fontWeight: 600, color: '#333333' }}>${fees.base.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666666' }}>Expedited Processing</span>
                      <span style={{ fontWeight: 600, color: '#333333' }}>${fees.speed.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666666' }}>International Secure Shipping</span>
                      <span style={{ fontWeight: 600, color: '#333333' }}>${fees.shipping.toFixed(2)}</span>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#f0f0f0', margin: '0.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 'bold' }}>
                      <span style={{ color: '#1a1a1a' }}>Total Due</span>
                      <span style={{ color: '#7a0c2e', fontSize: '1.6rem', fontFamily: 'Georgia, serif' }}>
                        ${fees.total.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#888888', textAlign: 'right', marginTop: '-4px' }}>
                      To be billed to card ending in 4242
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Legal Release Consent Section */}
            <div style={{
              background: '#fcfbfa',
              border: '1px solid #e8e6e1',
              borderRadius: '8px',
              padding: '1.5rem',
              marginTop: '2rem',
              display: 'flex',
              gap: '12px',
              boxSizing: 'border-box'
            }}>
              <input 
                type="checkbox" 
                id="release_authorized"
                name="release_authorized"
                checked={formData.release_authorized}
                onChange={handleInputChange}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#7a0c2e', cursor: 'pointer' }}
              />
              <label htmlFor="release_authorized" style={{ fontSize: '0.85rem', color: '#444444', lineHeight: 1.5, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                <strong>Authorization and Consent to Release Academic Records</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666666' }}>
                  By checking this box, I formally authorize Heritage Academy to release the official academic records detailed above to the specified recipient. I certify that I am the legal parent or guardian of the student, or an eligible student over the age of 18. I understand that this request is subject to administrative review and that payment of the non-refundable fees outlined above will be processed immediately upon submission.
                </p>
              </label>
            </div>

            {/* Error Message */}
            {error && <div style={{ color: '#cc0000', fontSize: '0.85rem', marginTop: '1.5rem', fontWeight: 500 }}>{error}</div>}

            {/* Bottom Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                onClick={prevStep}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cccccc',
                  color: '#555555',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => navigate('/dashboard/parents')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #7a0c2e',
                    color: '#7a0c2e',
                    padding: '0.65rem 2rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Save as Draft
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.release_authorized}
                  style={{
                    background: formData.release_authorized ? '#7a0c2e' : '#c2a3b0',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 2.5rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: formData.release_authorized ? 'pointer' : 'not-allowed',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Finalize & Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DIGITAL SIGNATURE */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>
                Return to Document Queue
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 'bold', color: '#5c0922', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem 0' }}>
                Digital Signature Authorization
              </h1>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Please review the terms below and provide your digital signature to officially execute this document. Your signature is legally binding.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              
              {/* Left Column: Signature pad & Legal */}
              <div style={{ flex: '1 1 550px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* Legal Acknowledgement text box */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxSizing: 'border-box'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5c0922', margin: '0 0 1rem 0', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Legal Acknowledgement
                  </h3>

                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    border: '1px solid #f0f0f0',
                    padding: '1rem',
                    background: '#fafafa',
                    fontSize: '0.825rem',
                    color: '#555555',
                    lineHeight: 1.6,
                    borderRadius: '6px',
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: '1.25rem'
                  }}>
                    By affixing my digital signature to this document, I hereby acknowledge that I have carefully read and fully understand all terms, conditions, and stipulations contained herein regarding the Heritage Academy Academic Code of Conduct and Extracurricular Participation Agreement for the current academic year.
                    <br /><br />
                    I certify that I am the legal parent or guardian of the student named in the accompanying request summary. I agree that my electronic signature constitutes a legally binding acceptance of these terms, carrying the exact same legal authority and obligations as if I had physically signed a printed copy of this document in ink.
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', boxSizing: 'border-box' }}>
                    <input 
                      type="checkbox" 
                      id="legal_acknowledged"
                      name="legal_acknowledged"
                      checked={formData.legal_acknowledged}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#7a0c2e', cursor: 'pointer' }}
                    />
                    <label htmlFor="legal_acknowledged" style={{ fontSize: '0.85rem', color: '#333', cursor: 'pointer', lineHeight: 1.4, fontFamily: "'Inter', sans-serif" }}>
                      I have read, understood, and accept the terms of the Legal Acknowledgement.
                    </label>
                  </div>
                </div>

                {/* Authorization Signature Pad */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5c0922', margin: 0, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Authorization Signature
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: '#888', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Required</span>
                  </div>

                  {/* Canvas Wrap */}
                  <div style={{ position: 'relative', border: '1px dashed #cccccc', borderRadius: '6px', background: '#fafafa', overflow: 'hidden' }}>
                    <SignatureCanvas 
                      ref={sigCanvas}
                      penColor="#7a0c2e"
                      canvasProps={{ 
                        style: { width: '100%', height: '180px', display: 'block' } 
                      }}
                    />
                    
                    {/* Clear Button */}
                    <button 
                      type="button"
                      onClick={clearSignature}
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: '#ffffff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Clear
                    </button>
                    
                    {/* Line for Signature */}
                    <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: '50px', borderBottom: '1px solid #ddd' }} />
                    <span style={{ position: 'absolute', left: '10%', bottom: '54px', fontSize: '0.85rem', color: '#bbb', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>X</span>
                  </div>

                  <p style={{ color: '#888888', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                    Use your mouse, finger, or stylus to sign within the designated area above.
                  </p>
                </div>

              </div>

              {/* Right Column: Request Summary Card */}
              <div style={{ flex: '1 1 350px' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  boxSizing: 'border-box'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5c0922', borderBottom: '1.5px solid #f0f0f0', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontFamily: 'Georgia, serif' }}>
                    Request Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div>
                      <div style={{ color: '#888888', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>DOCUMENT NAME</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        {selectedType.name === 'transcript' ? 'Extracurricular Consent & Code of Conduct' : selectedType.label}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888888', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>STUDENT</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#1a365d',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}>
                          EJ
                        </div>
                        <strong style={{ color: '#1a1a1a' }}>{formData.student_full_name}</strong>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888888', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>ACADEMIC YEAR</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>2024 - 2025</div>
                    </div>

                    <div>
                      <div style={{ color: '#888888', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>ISSUED BY</div>
                      <div style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        {selectedType.name === 'transcript' ? 'Athletics Department' : 'Registrar Office'}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888888', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>STATUS</div>
                      <span style={{
                        display: 'inline-block',
                        background: '#fff9c4',
                        color: '#f57f17',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        marginTop: '2px'
                      }}>
                        • Awaiting Signature
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#f0f0f0', margin: '0.25rem 0' }} />

                    {/* Notice box */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      background: '#fcfbfa',
                      border: '1px solid #e8e6e1',
                      padding: '0.85rem 1rem',
                      borderRadius: '6px',
                      color: '#555555',
                      fontSize: '0.75rem',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#cca43b', lineHeight: '1', marginTop: '2px' }}>i</div>
                      <span>
                        A copy of the executed document will be automatically saved to your <strong>Records archive</strong> upon successful submission.
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <div style={{ color: '#cc0000', fontSize: '0.85rem', marginTop: '1.5rem', fontWeight: 500 }}>{error}</div>}

            {/* Bottom panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
              <button 
                type="button"
                onClick={prevStep}
                disabled={loading}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cccccc',
                  color: '#555555',
                  padding: '0.65rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || !formData.legal_acknowledged}
                style={{
                  background: (loading || !formData.legal_acknowledged) ? '#c2a3b0' : '#7a0c2e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 2.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: (loading || !formData.legal_acknowledged) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {loading ? 'Submitting...' : 'Sign & Execute Document'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default NewRequest;
