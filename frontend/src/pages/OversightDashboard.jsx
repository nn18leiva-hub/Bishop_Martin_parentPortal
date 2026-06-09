import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, CheckCircle, Clock,
  AlertCircle, TrendingUp, Activity, ChevronRight,
  Filter, AlertTriangle, Database, Folder, Mail, Lock, MoreVertical
} from 'lucide-react';

/* ─────────────────────────────────────────
   Helper: Status Pill
   ───────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const map = {
    active: { label: 'Active', color: '#10b981', bg: '#d1fae5' },
    inactive: { label: 'Inactive', color: '#6b7280', bg: '#f3f4f6' },
    review: { label: 'Review', color: '#f59e0b', bg: '#fef3c7' }
  };
  const style = map[status.toLowerCase()] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: style.color,
      background: style.bg,
      textTransform: 'capitalize'
    }}>
      <span style={{ 
        display: 'inline-block', 
        width: 6, 
        height: 6, 
        borderRadius: '50%', 
        background: style.color, 
        marginRight: 6,
        verticalAlign: 'middle'
      }}></span>
      {style.label}
    </span>
  );
};

/* ─────────────────────────────────────────
   OversightDashboard Main Component
   ───────────────────────────────────────── */
const OversightDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [dbUsers, setDbUsers]   = useState([]);
  const [dbStaff, setDbStaff]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [reqData, userData, staffData, statsData] = await Promise.all([
          apiFetch('/staff/requests'),
          apiFetch('/superadmin/users'),
          apiFetch('/superadmin/staff'),
          apiFetch('/superadmin/stats'),
        ]);
        setRequests(Array.isArray(reqData) ? reqData : []);
        setDbUsers(Array.isArray(userData) ? userData : []);
        setDbStaff(Array.isArray(staffData) ? staffData : []);
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

  // Live metrics from the database
  const liveTotalUsers = dbUsers.length + dbStaff.length;
  const livePendingCount = requests.filter(r => r.status === 'pending' || r.status === 'pending_verification').length;
  
  const onlineParents = stats ? stats.online.parents.reduce((a, c) => a + parseInt(c.count), 0) : 0;
  const onlineStaff   = stats ? stats.online.staff.reduce((a, c) => a + parseInt(c.count), 0) : 0;
  const activeSessions = Math.max(1, onlineParents + onlineStaff);

  // Combine staff and public users dynamically
  const registryUsers = [];

  // Add staff members
  dbStaff.forEach(s => {
    const parts = s.full_name.split(' ');
    const ini = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
    
    let roleLabel = 'Staff Member';
    if (s.role === 'super_admin') roleLabel = 'System Administrator';
    else if (s.role === 'admin') roleLabel = 'Office Admin';
    else if (s.role === 'viewer') roleLabel = 'Principal Viewer';

    registryUsers.push({
      name: s.full_name,
      id: `${s.staff_id}-S`,
      role: roleLabel,
      status: 'active',
      active: 'Just now',
      initials: ini || 'S'
    });
  });

  // Add parents / past students
  dbUsers.forEach(u => {
    const parts = u.full_name.split(' ');
    const ini = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();

    let roleLabel = 'Parent / Guardian';
    if (u.user_type === 'past_student') roleLabel = 'Past Student';

    registryUsers.push({
      name: u.full_name,
      id: `${u.id}-P`,
      role: roleLabel,
      status: u.verified ? 'active' : 'review',
      active: 'Recent',
      initials: ini || 'P'
    });
  });

  const adminBase = user?.role === 'principal' || user?.role === 'super_admin' ? '/superadmin' : '/staff';

  return (
    <div style={{ padding: '1rem 1.5rem 2rem 1.5rem' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="serif-title" style={{ fontSize: '2.2rem', margin: 0, fontWeight: 700 }}>
          Oversight Dashboard
        </h1>
      </div>

      {/* ── Stat Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Total Users Card */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Total Users
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0 }}>
            {liveTotalUsers}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>↗</span> Active users registered
          </p>
        </div>

        {/* Active Sessions Card */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Active Sessions
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0 }}>
            {activeSessions}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#888888', margin: '6px 0 0 0' }}>
            Current live connections
          </p>
        </div>

        {/* Pending Approvals Card (with Maroon Left Accent) */}
        <div className="mock-card stat-card-accent">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Pending Approvals
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0 }}>
            {livePendingCount}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#7a0c2e', fontWeight: 600, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.9rem' }}>⚠️</span> Requires attention
          </p>
        </div>

        {/* System Uptime Card */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            System Uptime
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0 }}>
            99.98%
          </p>
          <p style={{ fontSize: '0.8rem', color: '#888888', margin: '6px 0 0 0' }}>
            Last 30 days
          </p>
        </div>

      </div>

      {/* ── Main Two-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: User Registry */}
        <div className="mock-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2c2c2c', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif" }}>
                Institutional User Registry
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#888888', margin: 0 }}>
                Recent platform access and role modifications.
              </p>
            </div>
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: '#ffffff', 
              border: '1px solid #eaeaea', 
              borderRadius: '6px', 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              color: '#444',
              cursor: 'pointer'
            }}>
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* User Registry Table */}
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User / ID</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Active</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registryUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem 0.5rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  registryUsers.slice(0, 8).map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                      {/* User / ID */}
                      <td style={{ padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: '#7a0c2e', 
                          color: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '0.75rem', 
                          fontWeight: 700 
                        }}>
                          {u.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2c2c' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#888888' }}>ID: {u.id}</div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: '#555555' }}>
                        {u.role}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <StatusPill status={u.status} />
                      </td>

                      {/* Last Active */}
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: '#777777' }}>
                        {u.active}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* View Complete Registry Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eaeaea' }}>
            <span 
              onClick={() => navigate(`${adminBase}/users`)}
              style={{ color: '#7a0c2e', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', hover: { textDecoration: 'underline' } }}
            >
              View Complete Registry
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Scheduled Maintenance Widget */}
          <div className="mock-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2c2c2c', margin: '0 0 6px 0', fontFamily: "'Outfit', sans-serif" }}>
                  Scheduled Maintenance
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#555555', margin: 0, lineHeight: 1.4 }}>
                  Database optimization scheduled for Sunday at 02:00 AM EST. Expected downtime: 45 minutes.
                </p>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <span 
                style={{ color: '#7a0c2e', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                onClick={() => alert('Maintenance details: System updates will be applied to the PostgreSQL cluster.')}
              >
                View Details
              </span>
            </div>
          </div>

          {/* System Environment Widget */}
          <div className="mock-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2c2c2c', margin: '0 0 1.25rem 0', fontFamily: "'Outfit', sans-serif" }}>
              System Environment
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Core Database */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                  <Database size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2c2c2c' }}>Core Database</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '1px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }}></span> Operational
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: 1 }}>Primary Cluster</div>
                </div>
              </div>

              {/* Authentication API */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                  <Lock size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2c2c2c' }}>Authentication API</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '1px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }}></span> Operational
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: 1 }}>OAuth 2.0 Gateway</div>
                </div>
              </div>

              {/* Document Storage */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                  <Folder size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2c2c2c' }}>Document Storage</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '1px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b' }}></span> High Load
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: 1 }}>S3 Buckets</div>
                </div>
              </div>

              {/* Email Service */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                  <Mail size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2c2c2c' }}>Email Service</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '1px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }}></span> Operational
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: 1 }}>SMTP Relay</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OversightDashboard;
