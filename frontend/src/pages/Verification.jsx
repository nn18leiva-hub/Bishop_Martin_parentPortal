import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, ShieldAlert, UploadCloud, FileText, CheckCircle, Check, Lock, Info, ArrowRight, Folder, Calendar } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../contexts/ThemeLanguageContext';

const Verification = () => {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const { theme } = useSettings();
  const dk = theme === 'dark';

  const c = {
    outerCard:     'var(--card-bg, #ffffff)',
    outerBorder:   'var(--border-color, #eaeaea)',
    subCard:       'var(--page-bg, #fcfbfa)',
    subBorder:     'var(--border-color, #e8e6e1)',
    divider:       'var(--border-color, #eae5db)',
    dashedDivider: 'var(--border-color, #eae5db)',
    textMain:      'var(--text-color, #2c2c2c)',
    textSub:       'var(--text-sub, #555555)',
    textMuted:     'var(--text-muted, #8e8b82)',
    textValue:     'var(--text-value, #2c2c2c)',
    statusLabel:   'var(--secondary-btn-text, #4a4743)',
    verifiedBg:    dk ? 'rgba(16,185,129,0.12)' : '#d1fae5',
    pendingBg:     dk ? 'rgba(217,119,6,0.12)'  : '#fef3c7',
    infoBg:        dk ? '#1e1a10'  : '#fcfbfa',
    needHelpText:  'var(--text-sub, #999999)',
  };
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!user) return null;

  const isVerified = user.verified || user.ssn_verified;
  const hasUploaded = user.ssn_card_image_path;

  const uploadFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('ssn_image', file);
    setUploading(true);
    setError('');
    try {
      await apiFetch('/parent/upload-ssn-card', { method: 'POST', body: formData });
      await fetchProfile();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSSNUpload = async (e) => {
    const file = e.target.files?.[0];
    await uploadFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  // Submissions list
  const submissions = [
    { name: 'Verification_Form_A.pdf', date: 'Oct 24, 2023', status: 'Processing', isPdf: true },
    { name: 'ID_Scan_Front.jpg', date: 'Oct 20, 2023', status: 'Verified', isPdf: false }
  ];

  if (hasUploaded) {
    submissions.unshift({
      name: 'Social_Security_Card.png',
      date: new Date(user.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: isVerified ? 'Verified' : 'Processing',
      isPdf: false
    });
  }

  // Step indicator state
  const currentStep = isVerified ? 3 : (hasUploaded ? 3 : 2);

  return (
    <div className="animate-up" style={{ padding: '1rem 0', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Step Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 3rem auto', maxWidth: '500px', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '10%',
          right: '10%',
          height: '2px',
          background: '#eae5db',
          zIndex: 1
        }}></div>
        
        {/* Step 1 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#7a0c2e',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            border: '2px solid #7a0c2e'
          }}>
            <Check size={16} strokeWidth={3} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a0c2e', marginTop: '8px', fontFamily: "'Inter', sans-serif" }}>
            Personal Details
          </span>
        </div>

        {/* Step 2 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#ffffff',
            color: '#cca43b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            border: currentStep >= 2 ? '3px solid #cca43b' : '2px solid #eae5db'
          }}>
            {currentStep > 2 ? <Check size={16} strokeWidth={3} color="#cca43b" /> : (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cca43b' }}></div>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: currentStep >= 2 ? '#4a4743' : '#a19e99', marginTop: '8px', fontFamily: "'Inter', sans-serif" }}>
            Document Upload
          </span>
        </div>

        {/* Step 3 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: currentStep === 3 ? '#7a0c2e' : '#ffffff',
            color: currentStep === 3 ? '#ffffff' : '#a19e99',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: currentStep === 3 ? '2px solid #7a0c2e' : '2px solid #eae5db'
          }}>
            {currentStep === 3 ? <Check size={16} strokeWidth={3} /> : '3'}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: currentStep === 3 ? '#7a0c2e' : '#a19e99', marginTop: '8px', fontFamily: "'Inter', sans-serif" }}>
            Confirmation
          </span>
        </div>
      </div>

      {hasUploaded || isVerified ? (
        /* ── STEP 3 / CONFIRMATION / SUCCESS SCREEN ── */
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <div className="mock-card" style={{ 
            background: c.outerCard, 
            border: `1px solid ${c.outerBorder}`, 
            borderTop: '4px solid #7a0c2e', 
            borderRadius: '14px', 
            padding: '3rem 2.5rem', 
            width: '100%', 
            maxWidth: '560px', 
            boxShadow: dk ? '0 15px 45px rgba(0,0,0,0.3)' : '0 15px 45px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}>
            {/* Green Check Icon */}
            <div style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.08)', 
              border: '2px solid #10b981',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem auto',
              color: '#10b981'
            }}>
              <Check size={28} strokeWidth={3} />
            </div>

            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: c.textMain, margin: '0 0 0.5rem 0', fontFamily: "Georgia, serif" }}>
              {isVerified ? 'Verification Approved' : 'Verification Submitted'}
            </h3>
            <p style={{ color: c.textSub, fontSize: '0.88rem', lineHeight: 1.5, margin: '0 auto 2rem auto', maxWidth: '440px' }}>
              {isVerified 
                ? 'Your legal parent/guardian identity has been successfully verified by the administration office.'
                : 'Your Social Security Card has been securely uploaded and is now pending review by the administration office.'
              }
            </p>

            {/* Submission Details Box */}
            <div style={{ 
              background: c.subCard, 
              border: `1px solid ${c.subBorder}`, 
              borderRadius: '8px', 
              padding: '1.25rem', 
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: c.textMuted, 
                letterSpacing: '0.08em', 
                borderBottom: `1px solid ${c.divider}`, 
                paddingBottom: '8px', 
                marginBottom: '12px' 
              }}>
                SUBMISSION DETAILS
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={16} color="#7a0c2e" />
                  <div>
                    <span style={{ fontSize: '0.7rem', color: c.textMuted, display: 'block' }}>Document Type</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: c.textValue }}>Social Security Card</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} color="#7a0c2e" />
                  <div>
                    <span style={{ fontSize: '0.7rem', color: c.textMuted, display: 'block' }}>Date Submitted</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: c.textValue }}>
                      {new Date(user.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px dashed ${c.dashedDivider}`, paddingTop: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.statusLabel }}>Status</span>
                  {isVerified ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: c.verifiedBg,
                      color: '#10b981'
                    }}>
                      • Verified
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: c.pendingBg,
                      color: '#d97706'
                    }}>
                      • Pending Review
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* What Happens Next Box */}
            <div style={{ 
              background: c.infoBg, 
              borderRadius: '8px', 
              border: `1px solid ${c.subBorder}`,
              padding: '1.25rem', 
              textAlign: 'left',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                background: 'rgba(204, 164, 59, 0.1)', 
                border: '1.5px solid #cca43b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <Info size={11} color="#cca43b" strokeWidth={3} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: c.textValue, margin: '0 0 4px 0' }}>What happens next?</h4>
                <p style={{ fontSize: '0.78rem', color: c.textSub, margin: 0, lineHeight: 1.4 }}>
                  {isVerified 
                    ? 'Your account profile is active. You can now download generated documents or proceed with other requests.'
                    : 'Our team will verify the document within 1-2 business days. You will receive an email notification once your identity verification is complete.'
                  }
                </p>
              </div>
            </div>

            {/* Return Button */}
            <button 
              onClick={() => navigate('/dashboard/parents')}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#7a0c2e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '1.5rem',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={16} />
            </button>

            {/* Help Link */}
            <div style={{ fontSize: '0.8rem', color: '#888888' }}>
              Need help? <Link to="/help" style={{ color: '#7a0c2e', fontWeight: 600, textDecoration: 'none' }}>Contact Administration</Link>
            </div>

          </div>
        </div>
      ) : (
        /* ── STEP 2 / DOCUMENT UPLOAD VIEW ── */
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c2c2c', fontFamily: "'Outfit', sans-serif", margin: '0 0 6px 0' }}>
              Identity Verification
            </h2>
            <p style={{ color: '#666666', fontSize: '0.9rem', margin: 0 }}>
              Securely submit your supporting documentation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {/* Left Column: Guidelines & Privacy */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Guidelines Card */}
              <div className="mock-card" style={{ padding: '1.5rem', border: '1px solid #e8e6e1', borderRadius: '10px', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <FileText size={20} color="#7a0c2e" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#7a0c2e', fontFamily: "Georgia, serif", margin: 0 }}>
                    Verification Guidelines
                  </h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      background: 'rgba(204, 164, 59, 0.1)', 
                      border: '1.5px solid #cca43b', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Check size={10} color="#cca43b" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#555555', lineHeight: 1.4 }}>
                      Ensure all four corners of the document are visible.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      background: 'rgba(204, 164, 59, 0.1)', 
                      border: '1.5px solid #cca43b', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Check size={10} color="#cca43b" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#555555', lineHeight: 1.4 }}>
                      Text must be legible and well-lit. Avoid glare.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      background: 'rgba(204, 164, 59, 0.1)', 
                      border: '1.5px solid #cca43b', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Check size={10} color="#cca43b" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#555555', lineHeight: 1.4 }}>
                      Accepted formats: JPG, PNG, PDF (Max 10MB).
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Card */}
              <div className="mock-card" style={{ padding: '1.5rem', border: '1px solid #e8e6e1', borderRadius: '10px', background: '#faf9f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                  <Lock size={18} color="#7a0c2e" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#7a0c2e', fontFamily: "Georgia, serif", margin: 0 }}>
                    Privacy & Security
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#555555', lineHeight: 1.5, margin: 0 }}>
                  Bishop Martin employs institutional-grade encryption for all transmitted documents. Your data is processed in strict compliance with federal privacy regulations and is automatically purged from processing servers upon verification completion.
                </p>
              </div>

            </div>

            {/* Right Column: Drag & Drop Upload Zone */}
            <div style={{ flex: '2 2 450px' }}>
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{ 
                  background: dragActive ? 'rgba(122, 12, 46, 0.02)' : '#ffffff', 
                  border: dragActive ? '2px dashed #7a0c2e' : '2px dashed #cca43b', 
                  borderRadius: '12px', 
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                }}
              >
                {/* Upload Icon Container */}
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '10px',
                  backgroundColor: '#f5f3f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  color: '#7a0c2e'
                }}>
                  <UploadCloud size={24} />
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2c2c2c', margin: '0 0 8px 0', fontFamily: "Georgia, serif" }}>
                  Drag & Drop your document here
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#888888', margin: '0 auto 1.5rem auto', maxWidth: '300px', lineHeight: 1.4 }}>
                  Securely upload a scanned copy or clear photograph of the official document.
                </p>

                {/* Browse Button */}
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#7a0c2e',
                  color: '#ffffff',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  margin: '0 auto',
                  width: 'fit-content',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  <span>Browse Files</span>
                  <Folder size={15} />
                  <input type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={handleSSNUpload} disabled={uploading} />
                </label>

                {uploading && (
                  <p style={{ fontSize: '0.8rem', color: '#7a0c2e', fontWeight: 600, marginTop: '1rem', margin: '1rem 0 0 0' }}>
                    Uploading document...
                  </p>
                )}

                {error && (
                  <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '1rem', margin: '1rem 0 0 0' }}>
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Submissions Section */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#7a0c2e', fontFamily: "Georgia, serif", marginBottom: '1rem' }}>
              Recent Submissions
            </h3>
            
            <div style={{ background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#faf9f6', borderBottom: '1px solid #eaeaea' }}>
                      <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em', fontWeight: 700 }}>DOCUMENT</th>
                      <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em', fontWeight: 700 }}>DATE SUBMITTED</th>
                      <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em', fontWeight: 700 }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < submissions.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                        
                        {/* Document Name Cell */}
                        <td style={{ padding: '1.1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={18} color="#7a0c2e" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2c2c', fontFamily: "'Inter', sans-serif" }}>
                              {sub.name}
                            </span>
                          </div>
                        </td>

                        {/* Date Cell */}
                        <td style={{ padding: '1.1rem 1.5rem', fontSize: '0.85rem', color: '#555555', fontFamily: "'Inter', sans-serif" }}>
                          {sub.date}
                        </td>

                        {/* Status Cell */}
                        <td style={{ padding: '1.1rem 1.5rem' }}>
                          {sub.status === 'Verified' ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: '20px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: '#d1fae5',
                              color: '#10b981'
                            }}>
                              • Verified
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: '20px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: '#fef3c7',
                              color: '#d97706'
                            }}>
                              • Processing
                            </span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;
