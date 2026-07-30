import { useState, useEffect } from 'react';
import { adminEarlyBirds } from '../../services/adminService';
import { FaApple, FaAndroid, FaLaptop, FaSearch, FaCopy, FaCheck } from 'react-icons/fa';

const metricCardStyle = {
  background: '#ffffff',
  border: '1px solid #EAEAEA',
  borderRadius: 16,
  padding: '16px 20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
  flex: '1 1 180px',
  minWidth: 150,
};

const metricLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 6,
};

const metricValueStyle = {
  fontSize: 22,
  fontWeight: 800,
  color: '#111827',
};

const CopyBadge = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#FFF6F2',
        color: '#FF5A1F',
        border: '1px dashed #FFD4C2',
        borderRadius: 8,
        padding: '4px 8px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'monospace',
        transition: 'transform 0.1s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span>{code}</span>
      {copied ? <FaCheck size={10} color="#22C55E" /> : <FaCopy size={10} style={{ opacity: 0.7 }} />}
    </div>
  );
};

const AdminEarlyBirdsTab = ({ colleges }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCollegeId, setFilterCollegeId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const fetchEarlyBirds = () => {
    setLoading(true);
    setError(null);
    
    // We fetch based on selected filter
    const collegeParam = filterCollegeId === 'all' ? undefined : filterCollegeId;

    adminEarlyBirds.list(collegeParam).then(({ data, error: err }) => {
      if (err) {
        setError(err);
      } else {
        setStudents(data?.students || []);
      }
      setLoading(false);
    });
  };

  useEffect(fetchEarlyBirds, [filterCollegeId]);

  // Frontend search filter
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );
  });

  // Calculate metrics
  const totalCount = filteredStudents.length;
  const iosCount = filteredStudents.filter(s => s.device_type === 'ios').length;
  const androidCount = filteredStudents.filter(s => s.device_type === 'android').length;
  const desktopCount = filteredStudents.filter(s => s.device_type === 'desktop' || !s.device_type).length;

  const iosPercent = totalCount ? Math.round((iosCount / totalCount) * 100) : 0;
  const androidPercent = totalCount ? Math.round((androidCount / totalCount) * 100) : 0;
  const desktopPercent = totalCount ? Math.round((desktopCount / totalCount) * 100) : 0;

  const claimedCouponCount = filteredStudents.filter(s => s.coupons?.coupon_code).length;
  const claimPercent = totalCount ? Math.round((claimedCouponCount / totalCount) * 100) : 0;

  const renderDeviceBadge = (device) => {
    if (device === 'ios') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F1F5F9', color: '#1e293b', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
          <FaApple size={11} /> iOS
        </span>
      );
    }
    if (device === 'android') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
          <FaAndroid size={11} /> Android
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
        <FaLaptop size={11} /> Desktop
      </span>
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Early Birds Dashboard</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
        Monitor pre-marketing signups, platform analytics, and claimed coupon codes.
      </p>

      {/* Metrics Row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={metricCardStyle}>
          <p style={metricLabelStyle}>Total Signups</p>
          <p style={metricValueStyle}>{totalCount}</p>
        </div>
        <div style={metricCardStyle}>
          <p style={metricLabelStyle}>iOS Users</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={metricValueStyle}>{iosCount}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>({iosPercent}%)</span>
          </div>
        </div>
        <div style={metricCardStyle}>
          <p style={metricLabelStyle}>Android Users</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={metricValueStyle}>{androidCount}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>({androidPercent}%)</span>
          </div>
        </div>
        <div style={metricCardStyle}>
          <p style={metricLabelStyle}>Desktop / Other</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={metricValueStyle}>{desktopCount}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>({desktopPercent}%)</span>
          </div>
        </div>
        <div style={metricCardStyle}>
          <p style={metricLabelStyle}>Claim Rate</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={metricValueStyle}>{claimedCouponCount}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>({claimPercent}% claimed)</span>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Left: Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #EAEAEA', borderRadius: 12, padding: '10px 14px', width: '100%', maxWidth: 300 }}>
          <FaSearch color="#9CA3AF" size={13} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111827', width: '100%' }}
          />
        </div>

        {/* Right: College selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>College:</span>
          <select
            value={filterCollegeId}
            onChange={(e) => setFilterCollegeId(e.target.value)}
            style={{ border: '1px solid #EAEAEA', borderRadius: 10, padding: '8px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}
          >
            <option value="all">All Colleges</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name} ({c.short_name})</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
          ⚠️ Failed to load students: {error}
        </div>
      )}

      {/* Table Card */}
      <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAFAFA', color: '#9CA3AF', borderBottom: '1px solid #EAEAEA', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Student Name</th>
              <th style={{ padding: '12px 16px' }}>Phone Number</th>
              <th style={{ padding: '12px 16px' }}>College</th>
              <th style={{ padding: '12px 16px' }}>Device</th>
              <th style={{ padding: '12px 16px' }}>Coupon</th>
              <th style={{ padding: '12px 16px' }}>Offer</th>
              <th style={{ padding: '12px 16px' }}>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>
                  <div style={{ width: 20, height: 20, border: '2px solid #FF5A1F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                  Loading early birds...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
                  No early birds registered matching the criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid #F9FAFB', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FCFCFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{student.name}</td>
                  <td style={{ padding: '12px 16px', color: '#4B5563' }}>{student.phone}</td>
                  <td style={{ padding: '12px 16px', color: '#4B5563' }}>
                    {student.colleges?.short_name || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {renderDeviceBadge(student.device_type)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {student.coupons?.coupon_code ? (
                      <CopyBadge code={student.coupons.coupon_code} />
                    ) : (
                      <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>no claim</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {student.rewards ? (
                      <div>
                        <span style={{ fontWeight: 700, color: '#111827' }}>{student.rewards.title}</span>
                        {student.rewards.description && (
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{student.rewards.description}</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                    {new Date(student.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminEarlyBirdsTab;
