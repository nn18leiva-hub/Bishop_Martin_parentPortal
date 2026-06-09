import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, CheckCircle, Clock, BarChart2,
  AlertCircle, TrendingUp, Activity, ChevronRight
} from 'lucide-react';

/* ─────────────────────────────────────────
   Helper: coloured status pill
───────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const map = {
    pending_verification: { label: 'Pending ID', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    pending:              { label: 'Pending',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    ready_for_pickup:     { label: 'Ready',       color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    completed:            { label: 'Completed',   color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    denied:               { label: 'Denied',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  };
  const style = map[status] || { label: status, color: '#888', bg: 'rgba(128,128,128,0.1)' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.color}33`,
      textTransform: 'uppercase'
    }}>
      {style.label}
    </span>
  );
};

/* ─────────────────────────────────────────
   Stat Card
───────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.4rem 1.5rem',
    border: '1px solid #eaeaea',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: color + '1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>{value}</p>
      {subtitle && <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 4 }}>{subtitle}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const OversightDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [users, setUsers]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [reqData, userData, statsData] = await Promise.all([
          apiFetch('/staff/requests'),
          apiFetch('/superadmin/users'),
          apiFetch('/superadmin/stats'),
        ]);
        setRequests(Array.isArray(reqData) ? reqData : []);
        setUsers(Array.isArray(userData) ? userData : []);
        setStats(statsData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#999' }}>
      <div className="db-loading-spinner" style={{ marginRight: 12 }}></div> Loading dashboard…
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', color: '#ef4444', background: '#fff5f5', borderRadius: 10, border: '1px solid #fecaca' }}>
      <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />{error}
    </div>
  );

  /* ── Computed stats ── */
  const totalRequests    = requests.length;
  const pendingCount     = requests.filter(r => r.status === 'pending' || r.status === 'pending_verification').length;
  const readyCount       = requests.filter(r => r.status === 'ready_for_pickup').length;
  const completedCount   = requests.filter(r => r.status === 'completed').length;

  const totalUsers       = users.length;
  const verifiedUsers    = users.filter(u => u.verified).length;

  const onlineParents    = stats ? stats.online.parents.reduce((a, c) => a + parseInt(c.count), 0) : 0;
  const onlineStaff      = stats ? stats.online.staff.reduce((a, c) => a + parseInt(c.count), 0) : 0;

  /* Recent 5 requests */
  const recentRequests   = [...requests].slice(0, 5);

  /* Document type breakdown */
  const docTypeCounts = requests.reduce((acc, r) => {
    const t = (r.document_type_name || 'unknown').replace(/_/g, ' ');
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const docTypeEntries = Object.entries(docTypeCounts).sort((a, b) => b[1] - a[1]);
  const maxDocCount = docTypeEntries[0]?.[1] || 1;

  /* User type breakdown */
  const parentCount      = users.filter(u => u.user_type === 'parent').length;
  const pastStudentCount = users.filter(u => u.user_type === 'past_student').length;

  const adminBase = user?.role === 'super_admin' ? '/superadmin' : '/staff';

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="db-page-header" style={{ marginBottom: '1.75rem' }}>
        <div className="db-page-eyebrow">OVERVIEW</div>
        <div className="db-page-title-row">
          <h1 className="db-page-title">Oversight Dashboard</h1>
          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
            Last refreshed: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>
          Real-time summary of all requests, users, and system activity.
        </p>
      </div>

      {/* ── Stat Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={FileText}    label="Total Requests"   value={totalRequests}  color="#6366f1" />
        <StatCard icon={Clock}       label="Pending"          value={pendingCount}   color="#f59e0b" subtitle="Awaiting action" />
        <StatCard icon={CheckCircle} label="Ready / Mailed"   value={readyCount}     color="#10b981" />
        <StatCard icon={TrendingUp}  label="Completed"        value={completedCount} color="#3b82f6" />
        <StatCard icon={Users}       label="Registered Users" value={totalUsers}     color="#8b5cf6" />
        <StatCard icon={Activity}    label="Online Now"       value={onlineParents + onlineStaff} color="#ec4899" subtitle="Within last 15 min" />
      </div>

      {/* ── Two-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Recent Requests */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>Recent Requests</h2>
            <button
              onClick={() => navigate(`${adminBase}/requests`)}
              style={{ background: 'none', border: 'none', color: '#7a0c2e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '1.5rem 0' }}>No requests yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentRequests.map(r => (
                <div key={r.request_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#222', marginBottom: 2 }}>{r.student_full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'capitalize' }}>
                      {(r.document_type_name || '').replace(/_/g, ' ')}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document type breakdown */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '1.25rem' }}>
            <BarChart2 size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#6366f1' }} />
            Requests by Document Type
          </h2>

          {docTypeEntries.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '1.5rem 0' }}>No data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {docTypeEntries.map(([type, count]) => (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize', color: '#333' }}>{type}</span>
                    <span style={{ color: '#888' }}>{count}</span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxDocCount) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #7a0c2e, #e11d48)',
                      borderRadius: 4,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── User breakdown row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* User account types */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>User Accounts</h2>
            <button
              onClick={() => navigate(`${adminBase}/users`)}
              style={{ background: 'none', border: 'none', color: '#7a0c2e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View directory <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'Parents',         count: parentCount,      color: '#6366f1' },
              { label: 'Past Students',   count: pastStudentCount, color: '#8b5cf6' },
              { label: 'Verified',        count: verifiedUsers,    color: '#10b981' },
              { label: 'Unverified',      count: totalUsers - verifiedUsers, color: '#f59e0b' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '0.875rem', color: '#444', fontWeight: 500 }}>{row.label}</span>
                <span style={{
                  fontWeight: 800, fontSize: '1rem',
                  color: row.color,
                  background: row.color + '15',
                  padding: '2px 12px',
                  borderRadius: 20
                }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Online activity */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '1.25rem' }}>
            <Activity size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#10b981' }} />
            Live Activity (last 15 min)
          </h2>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Parents Online', count: onlineParents, color: '#6366f1' },
              { label: 'Staff Online',   count: onlineStaff,   color: '#10b981' },
            ].map(row => (
              <div key={row.label} style={{ flex: 1, textAlign: 'center', padding: '1rem', background: row.color + '0d', borderRadius: 10, border: `1px solid ${row.color}22` }}>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: row.color, lineHeight: 1 }}>{row.count}</p>
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 6 }}>{row.label}</p>
              </div>
            ))}
          </div>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>System is operational</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OversightDashboard;
