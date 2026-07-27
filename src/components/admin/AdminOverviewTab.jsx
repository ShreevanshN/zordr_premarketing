import { useState, useEffect } from 'react';
import { adminAnalytics, adminCoupons } from '../../services/adminService';

const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: 20 };

const StatCard = ({ label, value }) => (
  <div style={card}>
    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{value}</p>
  </div>
);

const AdminOverviewTab = ({ college }) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [updatingCode, setUpdatingCode] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const load = () => {
    setStats(null);
    setError(null);
    adminAnalytics.get(college.id).then(({ data, error: err }) => {
      if (err) setError(err);
      else setStats(data);
    });
  };

  useEffect(load, [college.id]);

  const handleMarkSynced = async (couponCode) => {
    setUpdatingCode(couponCode);
    setUpdateError(null);
    const { error: err } = await adminCoupons.markSynced(college.id, couponCode);
    setUpdatingCode(null);
    if (err) {
      setUpdateError(err);
      return;
    }
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        couponLedger: prev.couponLedger.map((c) =>
          c.code === couponCode
            ? { ...c, appSynced: true, appSyncedAt: new Date().toISOString() }
            : c
        ),
      };
    });
  };

  if (error) return <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>;
  if (!stats) return <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</p>;

  const maxTrend = Math.max(...stats.signupTrend.map(d => d.count), 1);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{college.name}</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Status: <strong style={{ textTransform: 'capitalize' }}>{stats.college.campaignStatus}</strong> · Early Bird limit: {stats.college.earlyBirdLimit}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Signups" value={stats.totalSignups} />
        <StatCard label="Rewards Claimed" value={stats.totalRewardsClaimed} />
        <StatCard label="Confirmed Referrals" value={stats.totalReferrals} />
      </div>

      {/* Signup trend */}
      <div style={{ ...card, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Signups — last 14 days</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
          {stats.signupTrend.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: `${Math.max((d.count / maxTrend) * 80, 2)}px`, background: '#FF5A1F', borderRadius: 3 }} title={`${d.date}: ${d.count}`} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF', marginTop: 6 }}>
          <span>{stats.signupTrend[0]?.date}</span>
          <span>{stats.signupTrend[stats.signupTrend.length - 1]?.date}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Reward distribution */}
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Reward distribution</p>
          {stats.rewardDistribution.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>No coupons issued yet.</p>
          ) : stats.rewardDistribution.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < stats.rewardDistribution.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ fontSize: 13 }}>{r.title}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon ledger */}
      <div style={{ ...card, marginTop: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Coupon ledger (latest 100)</p>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
          Coupons are generated fresh per claim. After you add a code to the mobile app, click <strong>Update</strong> so students can redeem the reward there.
        </p>
        {updateError && (
          <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>{updateError}</p>
        )}
        {stats.couponLedger.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nothing issued yet.</p>
        ) : (
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #EAEAEA' }}>
                  <th style={{ padding: '6px 4px' }}>Code</th>
                  <th style={{ padding: '6px 4px' }}>Reward</th>
                  <th style={{ padding: '6px 4px' }}>Claimed at</th>
                  <th style={{ padding: '6px 4px' }}>App</th>
                  <th style={{ padding: '6px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {stats.couponLedger.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '6px 4px', fontWeight: 600 }}>{c.code}</td>
                    <td style={{ padding: '6px 4px' }}>{c.rewardTitle}</td>
                    <td style={{ padding: '6px 4px', color: '#6B7280' }}>{c.claimedAt ? new Date(c.claimedAt).toLocaleString() : '—'}</td>
                    <td style={{ padding: '6px 4px' }}>
                      {c.appSynced ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>Live</span>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                      {c.appSynced ? (
                        <span style={{ color: '#9CA3AF', fontSize: 11 }}>
                          {c.appSyncedAt ? new Date(c.appSyncedAt).toLocaleDateString() : 'Updated'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingCode === c.code}
                          onClick={() => handleMarkSynced(c.code)}
                          style={{
                            background: '#FF5A1F',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '5px 12px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: updatingCode === c.code ? 'default' : 'pointer',
                            opacity: updatingCode === c.code ? 0.7 : 1,
                          }}
                        >
                          {updatingCode === c.code ? 'Updating…' : 'Update'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewTab;
