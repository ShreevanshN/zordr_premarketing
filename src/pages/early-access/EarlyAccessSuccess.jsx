import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';
import { useCollege } from '../../context/CollegeContext';
import { getStudentSession } from '../../services/studentService';
import { getReferralStats } from '../../services/referralService';

const EarlyAccessSuccess = () => {
  const navigate = useNavigate();
  const { college, slug } = useCollege();
  const primary = college?.theme?.primary || '#FF5A1F';
  const [session] = useState(() => getStudentSession(slug));
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    if (!session?.studentId) return;
    getReferralStats(slug).then(({ data, error: err }) => {
      if (err) setStatsError(err);
      else setStats(data);
    });
  }, [slug, session?.studentId]);

  const referralCode = session?.referralCode;
  const couponCode = session?.couponCode;
  const referralLink = referralCode ? `zordr.in/${slug}?ref=${referralCode}` : null;

  const copyCode = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const whatsappShare = () => {
    if (!referralLink) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join Zordr before launch and get exclusive rewards! Use my link: https://${referralLink}`)}`, '_blank');
  };

  // No signup found in this session (e.g. someone landed here directly,
  // or opened the link in a different browser tab). Point them back to
  // signup instead of showing broken/empty state.
  if (!session?.studentId) {
    return (
      <EarlyAccessLayout>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🐦</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>We couldn't find your signup</h2>
          <p style={{ color: '#6B7280', marginBottom: 24, fontSize: 14 }}>This can happen if you opened this link in a new tab. Sign up again to get your reward.</p>
          <button onClick={() => navigate(`/${slug}/signup`)} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Become an Early Bird
          </button>
        </div>
      </EarlyAccessLayout>
    );
  }

  return (
    <EarlyAccessLayout>
      {/* Success header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>🎉 You're officially an</p>
        <h1 style={{ fontSize: 'clamp(22px, 7vw, 28px)', fontWeight: 800, color: primary }}>Early Bird!</h1>
      </div>

      {/* Reward code */}
      {couponCode ? (
        <div style={{ background: '#fff', border: `1.5px dashed ${primary}`, borderRadius: 14, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Your launch-week code</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: 800, color: primary, letterSpacing: '0.1em' }}>{couponCode}</span>
            <button onClick={copyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{copied ? '✅' : '📋'}</button>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>⏳ Valid only during launch week.</p>
        </div>
      ) : (
        <button
          onClick={() => navigate(`/${slug}/reward`)}
          style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}
        >
          🎁 Pick your reward card →
        </button>
      )}

      {/* Referral */}
      <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🔥 Bring your friends before spots run out.</h3>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>The bigger the community before launch, the bigger the launch itself. 🚀</p>

        {/* Referral link box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#6B7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{referralLink}</span>
          <button onClick={copyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>📋</button>
        </div>
        {linkCopied && <p style={{ fontSize: 12, color: '#22C55E', marginBottom: 8 }}>Copied!</p>}

        {/* Share buttons — stack on very small screens */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 8px', border: '1px solid #EAEAEA', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            🔗 Copy Link
          </button>
          <button onClick={whatsappShare} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 8px', border: '1px solid #EAEAEA', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#22C55E' }}>
            📱 WhatsApp
          </button>
        </div>
      </div>

      {/* Referral count + milestone ladder */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>👥</span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Friends joined using your link</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: primary, flexShrink: 0 }}>{stats?.referralCount ?? '—'}</span>
      </div>

      {stats?.milestones?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🎯 Referral Rewards</h3>
          {stats.milestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.milestones.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.achieved ? primary : '#F3F4F6', color: m.achieved ? '#fff' : '#9CA3AF', fontSize: 11, fontWeight: 700,
                }}>
                  {m.achieved ? '✓' : m.referralCount}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: m.achieved ? '#111827' : '#9CA3AF' }}>{m.referralCount} referral{m.referralCount > 1 ? 's' : ''} — {m.rewardTitle}</div>
                  {m.achieved && m.couponCode && <div style={{ fontSize: 11, color: primary, fontWeight: 600 }}>{m.couponCode}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {statsError && <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 }}>Referral stats aren't available right now.</p>}

      {/* Leaderboard */}
      {stats?.leaderboard?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🏆 Top Sharers</h3>
          {stats.leaderboard.map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.leaderboard.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? primary : '#F3F4F6', color: i === 0 ? '#fff' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{u.firstName}</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{u.referralCount}</span>
            </div>
          ))}
        </div>
      )}


    </EarlyAccessLayout>
  );
};

export default EarlyAccessSuccess;
