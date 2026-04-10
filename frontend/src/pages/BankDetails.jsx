import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { UploadCloud, Building, CheckCircle, Info } from 'lucide-react';


const BankDetails = () => {
  const [instructions, setInstructions] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [uploadingReceipt, setUploadingReceipt] = useState(null);

  const loadData = async () => {
    try {
      const [instData, reqData] = await Promise.all([
        apiFetch('/payment/instructions').catch(() => null),
        apiFetch('/requests/my-requests')
      ]);
      setInstructions(instData);
      
      // Filter requests to ONLY show those that require payment and are pending
      const unpaidRequests = Array.isArray(reqData) 
        ? reqData.filter(req => req.requires_payment && req.status === 'pending')
        : [];
      setRequests(unpaidRequests);
    } catch (err) {
      setError('Failed to load bank details or pending requests: ' + err.message);
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
      loadData(); // Refresh the list
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingReceipt(null);
    }
  };

  if (loading) return <div className="app-container p-4">Loading payment details...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2>Bank Details & Payments</h2>
          <p style={{ color: 'var(--text-muted)' }}>View school account details and upload payment receipts.</p>
        </div>
      </div>

      {error && <div className="error-text mb-4 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

      <div className="form-grid form-grid-2">
        
        {/* Left Column: Bank Details Card */}
        <div className="glass-panel" style={{ borderTop: '4px solid #10b981' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
              <Building size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Official Bank Account</h3>
          </div>
          
          {instructions ? (
            <div className="mb-4">
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bank Name</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>{instructions.bank_name}</p>
                
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Account Name</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>{instructions.account_name}</p>
                
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Account Number</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px', color: '#10b981' }}>{instructions.account_number}</p>
              </div>
              
              <div className="mt-4 flex items-start gap-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Info size={20} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {instructions.instructions}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted">No bank details are currently configured in the system.</p>
          )}
        </div>

        {/* Right Column: Upload Receipts List */}
        <div className="glass-panel text-white">
          <h3 className="mb-4" style={{ fontSize: '1.125rem', fontWeight: '600' }}>Awaiting Payment / Receipt</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
            The following requests are currently paused awaiting payment verification. Select the correct document and upload a picture of your bank transfer receipt.
          </p>

          {requests.length === 0 ? (
            <div className="text-center p-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
              <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>You have no pending requests that require a payment receipt.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map(req => (
                <div key={req.request_id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 500 }}>{req.document_type_name || `Document #${req.document_type_id}`}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>For: {req.student_full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requested: {new Date(req.request_date).toLocaleDateString()}</p>
                  </div>
                  
                  <label className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, width: 'auto' }}>
                    {uploadingReceipt === req.request_id ? 'Uploading...' : 'Upload Receipt'}
                    <UploadCloud size={16} />
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleReceiptUpload(req.request_id, e)} disabled={uploadingReceipt === req.request_id} />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default BankDetails;
