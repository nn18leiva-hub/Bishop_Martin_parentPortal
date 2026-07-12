import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { 
  Upload, 
  FileDown, 
  Printer, 
  Building, 
  Check, 
  RotateCw, 
  Clock, 
  Info, 
  Copy, 
  Bell, 
  User, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BankDetails = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadData = async () => {
    try {
      const reqData = await apiFetch('/requests/my-requests');
      // Filter requests to ONLY show those that require payment and are pending
      const unpaidRequests = Array.isArray(reqData) 
        ? reqData.filter(req => req.status === 'pending')
        : [];
      setRequests(unpaidRequests);
    } catch (err) {
      setError('Failed to load pending requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceiptUpload = async (request_id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('request_id', request_id);
    formData.append('receipt_image', file);

    setUploadingReceipt(request_id);
    try {
      await apiFetch('/payment/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      alert("Receipt uploaded! The administration will verify it shortly.");
      loadData();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingReceipt(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: "${text}" to clipboard.`);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? requests.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === requests.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <div style={{ background: '#faf9f6', minHeight: '100vh', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>Loading payment details...</div>;

  // Use dynamic request data if available in the database, otherwise default to the exact mockup data
  const activeRequest = requests.length > 0 ? requests[currentIndex] : null;
  const requestId = activeRequest ? activeRequest.request_id : 9128;
  const studentName = activeRequest ? activeRequest.student_full_name : 'Leo Wilson';
  const gradeLevel = activeRequest ? activeRequest.student_graduation_year_or_years_attended : 'Grade 11-B';
  const documentName = activeRequest ? activeRequest.document_type_name : 'Official Transcript';
  const dateFormatted = activeRequest 
    ? new Date(activeRequest.request_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Sep 01, 2024';

  const getRequestFee = (req) => {
    if (!req) return '$70.00';
    try {
      const data = typeof req.form_data === 'string' ? JSON.parse(req.form_data) : req.form_data;
      if (data && data.total_fee !== undefined) {
        return typeof data.total_fee === 'number' 
          ? `$${data.total_fee.toFixed(2)}` 
          : `$${data.total_fee}`;
      }
    } catch (e) {
      console.error(e);
    }
    return '$70.00';
  };

  const documentFee = getRequestFee(activeRequest);
  const docRef = `TU-2024-${String(requestId).padStart(4, '0')}`;
  const transferRef = `DOC-REQ-2024-${studentName.split(' ').pop().toUpperCase()}`;

  return (
    <div style={{ background: '#faf9f6', minHeight: '100vh', paddingBottom: '3rem' }}>
      
      {/* Top Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        padding: '0.8rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        boxSizing: 'border-box'
      }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button 
            onClick={() => navigate('/dashboard/parents')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#7a0c2e', fontSize: '1rem', fontWeight: 'bold', padding: 0, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}
          >
            <ArrowLeft size={16} /> Bank Transfer Details
          </button>
          <div style={{ fontSize: '0.8rem', color: '#888888', fontFamily: "'Inter', sans-serif" }}>
            Requests &gt; {docRef} &gt; Document Fee Payment
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Bell size={20} /></button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><User size={20} /></button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {error && <div style={{ color: '#cc0000', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>{error}</div>}

        {/* Warning Alert Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          background: '#fff9e6',
          borderLeft: '4px solid #cca43b',
          borderRadius: '4px',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#cca43b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            flexShrink: 0,
            marginTop: '2px'
          }}>i</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', lineHeight: 1.5, color: '#3c3a35' }}>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>Document Processing Details</strong>
            To finalize your document request, please initiate a transfer for the processing fee from your bank account using the details below. Once completed, upload your receipt using the portal or via email to <strong style={{ color: '#7a0c2e' }}>registrar@bishopmartin.edu</strong>.
          </div>
        </div>

        {/* Two Column Content */}
        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          
          {/* Left Column: Bank Account Details */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{
              background: '#ffffff',
              border: '1px solid #eaeaea',
              borderRadius: '8px',
              padding: '2rem',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Ghost building icon background */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.03, pointerEvents: 'none' }}>
                <Building size={160} />
              </div>

              {/* Card Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f9f6e8',
                  border: '1.5px solid #cca43b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cca43b'
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: '0.04em', fontFamily: "'Inter', sans-serif" }}>
                  OFFICIAL RECEIVING ACCOUNT
                </h3>
              </div>

              {/* Bank Info Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem 1.5rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif", marginBottom: '2rem' }}>
                <div>
                  <div style={{ color: '#8e8b82', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>BANK NAME</div>
                  <div style={{ color: '#2d2d2d', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'Georgia, serif' }}>Heritage Trust International</div>
                </div>
                <div>
                  <div style={{ color: '#8e8b82', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>ACCOUNT HOLDER</div>
                  <div style={{ color: '#2d2d2d', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'Georgia, serif' }}>Bishop Martin High School</div>
                </div>
                <div>
                  <div style={{ color: '#8e8b82', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>ACCOUNT NUMBER (SWIFT/IBAN)</div>
                  <div style={{ color: '#2d2d2d', fontWeight: 'bold', fontSize: '1.25rem' }}>HTI-002-8839-441-9</div>
                </div>
                <div>
                  <div style={{ color: '#8e8b82', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>BRANCH CODE / ROUTING</div>
                  <div style={{ color: '#2d2d2d', fontWeight: 'bold', fontSize: '1.25rem' }}>884-0012</div>
                </div>
              </div>

              {/* Reference number block */}
              <div style={{ width: '100%', height: '1px', backgroundColor: '#f0f0f0', marginBottom: '1.5rem' }} />

              <div style={{ fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ color: '#8e8b82', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>TRANSFER REFERENCE (MANDATORY)</div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f4f1eb',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  boxSizing: 'border-box'
                }}>
                  <strong style={{ color: '#4a4743', fontSize: '0.95rem' }}>{transferRef}</strong>
                  <button 
                    onClick={() => copyToClipboard(transferRef)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcdad5',
                      borderRadius: '4px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#4a4743',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    <Copy size={12} /> COPY REF
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Invoice Details & Actions */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {requests.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                padding: '2.5rem 1.75rem',
                boxSizing: 'border-box',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <CheckCircle size={56} color="#10b981" style={{ marginBottom: '1.25rem', display: 'block', margin: '0 auto 1.25rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif' }}>
                  No Payments Due
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#666663', lineHeight: 1.5, margin: 0 }}>
                  You currently have no pending document requests requiring payment.
                </p>
              </div>
            ) : (
              <>
                {/* Summary details card */}
                <div style={{
                  background: '#f4f1eb',
                  border: '1px solid #e5e3df',
                  borderRadius: '8px',
                  padding: '1.75rem',
                  boxSizing: 'border-box'
                }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 1.25rem 0', fontFamily: 'Georgia, serif', borderBottom: '1px solid #e0deda', paddingBottom: '0.5rem' }}>
                    Request Summary
                  </h3>

                  {requests.length > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#ffffff',
                      border: '1px solid #e0deda',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      marginBottom: '1.25rem',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      boxSizing: 'border-box'
                    }}>
                      <button 
                        onClick={handlePrev}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7a0c2e',
                          cursor: 'pointer',
                          fontWeight: 800,
                          padding: '4px 8px',
                          fontSize: '0.95rem'
                        }}
                      >
                        &larr;
                      </button>
                      <span style={{ color: '#4a4743' }}>Request {currentIndex + 1} of {requests.length}</span>
                      <button 
                        onClick={handleNext}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7a0c2e',
                          cursor: 'pointer',
                          fontWeight: 800,
                          padding: '4px 8px',
                          fontSize: '0.95rem'
                        }}
                      >
                        &rarr;
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666663' }}>Reference</span>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{docRef}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666663' }}>Student</span>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{studentName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666663' }}>Grade Level</span>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{gradeLevel}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666663' }}>Due Date</span>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{dateFormatted}</span>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#e0deda', margin: '0.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>Document Fee</strong>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#888885', marginTop: '2px' }}>Processing and administrative fees included</span>
                      </div>
                      <span style={{ color: '#7a0c2e', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                        {documentFee}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#fbf5e1',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      color: '#b78103',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginTop: '0.5rem',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{ fontSize: '1rem', lineHeight: '1' }}>•</span>
                      <span>Payment Awaiting Confirmation</span>
                    </div>

                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{
                    background: '#7a0c2e',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}>
                    {uploadingReceipt ? 'UPLOADING...' : 'UPLOAD TRANSFER RECEIPT'}
                    <Upload size={16} />
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={(e) => handleReceiptUpload(requestId, e)} 
                      disabled={uploadingReceipt !== null} 
                    />
                  </label>

                  <button style={{
                    background: '#ffffff',
                    border: '1px solid #dcdad5',
                    color: '#4a4743',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: 'border-box'
                  }} onClick={() => alert('Downloading PDF invoice...')}>
                    DOWNLOAD INVOICE (PDF) <FileDown size={16} />
                  </button>

                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#4a4743',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    fontFamily: "'Inter', sans-serif"
                  }} onClick={() => window.print()}>
                    <Printer size={15} /> Print Instructions
                  </button>
                </div>
              </>
            )}

            {/* Assistance card */}
            <div style={{
              background: '#f7f6f4',
              border: '1px solid #e8e6e1',
              borderRadius: '6px',
              padding: '1.25rem',
              boxSizing: 'border-box'
            }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1a1a1a', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>Need Assistance?</strong>
              <p style={{ fontSize: '0.8rem', color: '#666663', lineHeight: 1.4, margin: '0 0 10px 0', fontFamily: "'Inter', sans-serif" }}>
                Our bursar's office is available Mon-Fri, 8:00 AM - 4:30 PM for any billing inquiries.
              </p>
              <button 
                onClick={() => alert('Contacting billing support...')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#7a0c2e', fontWeight: 'bold', fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}
              >
                Contact Billing Support &gt;
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Timeline Stepper */}
        {requests.length > 0 && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            padding: '1.75rem 2rem',
            boxSizing: 'border-box',
            marginTop: '2rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 1.5rem 0', fontFamily: "'Inter', sans-serif" }}>
              Payment Processing Timeline
            </h4>

            {/* Horizontal Stepper timeline layout */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>
              
              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#7a0c2e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#1a1a1a', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>REQUESTED</strong>
                  <span style={{ color: '#888888', fontSize: '0.68rem', marginTop: '2px', display: 'block' }}>Today, 09:12 AM</span>
                </div>
              </div>

              {/* Line 1 */}
              <div style={{ flex: 1, minWidth: '40px', height: '1.5px', backgroundColor: '#7a0c2e' }} />

              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1.5px solid #cca43b',
                  backgroundColor: '#ffffff',
                  color: '#cca43b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <RotateCw size={12} strokeWidth={3} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#cca43b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>TRANSFER PENDING</strong>
                  <span style={{ color: '#888888', fontSize: '0.68rem', marginTop: '2px', display: 'block' }}>Awaiting action</span>
                </div>
              </div>

              {/* Line 2 */}
              <div style={{ flex: 1, minWidth: '40px', height: '1.5px', backgroundColor: '#eaeaea' }} />

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1.5px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#888888',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock size={12} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#888888', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>VERIFICATION</strong>
                  <span style={{ color: '#888888', fontSize: '0.68rem', marginTop: '2px', display: 'block' }}>24-48 Hours</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BankDetails;
