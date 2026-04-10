import React from 'react';
import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center" style={{ padding: '4rem 2rem' }}>
       <Construction size={64} color="var(--primary-color)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
       <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>Under Construction</h1>
       <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
          This section is currently being architected mapped. Please check back later when it's fully implemented!
       </p>
       <button onClick={() => navigate(-1)} className="btn-primary" style={{ width: 'auto' }}>
          Return to Dashboard
       </button>
    </div>
  );
};

export default ComingSoon;
