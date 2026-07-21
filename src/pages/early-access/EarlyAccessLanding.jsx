import { useNavigate } from 'react-router-dom';
import { useCollege } from '../../context/CollegeContext';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';

const benefits = [
  { icon: '🎁', label: 'Launch week rewards' },
  { icon: '⚡', label: 'Priority access at launch' },
  { icon: '🎫', label: 'Launch week code' },
  { icon: '🔔', label: 'Early updates & surprises' },
];

const EarlyAccessLanding = () => {
  const navigate = useNavigate();
  const { college, slug } = useCollege();

  const primary = college?.theme?.primary || '#FF5A1F';
  const claimed = college?.current_signup_count ?? 0;
  const total = college?.early_bird_limit ?? 500;
  const pct = total > 0 ? Math.round((claimed / total) * 100) : 0;
  const remaining = Math.max(total - claimed, 0);

  return (
    <EarlyAccessLayout>
      {/* Live badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF6F2', border: '1px solid #FFD4C0', borderRadius: 20, padding: '6px 14px', marginBottom: 20 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: primary, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: primary, fontWeight: 600 }}>Now live on campuses across India</span>
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: 'clamp(26px, 8vw, 32px)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 8 }}>
        Zordr is coming to<br />
        <span style={{ color: primary }}>{college?.short_name || college?.name}</span>
      </h1>
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 24 }}>Skip queues. Order smarter. Save time.</p>

      {/* Early Bird CTA */}
      <div style={{ background: '#FFF6F2', borderRadius: 16, padding: '16px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🐦</span>
          <span style={{ fontWeight: 700, color: primary, fontSize: 15 }}>Become an Early Bird.</span>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Be among the first {total} students to join before launch.</p>
      </div>

      {/* Progress */}
      <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 8 }}>🔥 EARLY BIRDS CLAIMED</div>
        <div style={{ fontSize: 'clamp(32px, 10vw, 40px)', fontWeight: 800, color: primary, lineHeight: 1 }}>
          {claimed} <span style={{ fontSize: 'clamp(18px, 6vw, 24px)', color: '#111827' }}>/ {total}</span>
        </div>
        <div style={{ margin: '12px 0 6px', height: 6, background: '#EAEAEA', borderRadius: 10 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: primary, borderRadius: 10 }} />
        </div>
        <p style={{ fontSize: 13, color: primary, fontWeight: 500 }}>{remaining} spots remaining</p>
      </div>

      {/* Benefits — 2x2 on mobile, 4-col on wider screens */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>What you'll unlock as an Early Bird</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '12px 6px', background: '#fff', border: '1px solid #EAEAEA', borderRadius: 12 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{b.icon}</div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, lineHeight: 1.3 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <button
        onClick={() => navigate(`/${slug}/signup`)}
        style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        🐦 Become an Early Bird →
      </button>

      <button
        onClick={() => navigate(`/${slug}/campus-insider`)}
        style={{ width: '100%', background: '#fff', color: '#111827', border: '1px solid #EAEAEA', borderRadius: 14, padding: '16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', textAlign: 'center' }}
      >
        👥 Want to do more? <strong>Become a Campus Insider</strong> →
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 20 }}>🔒 100% safe. We respect your privacy.</p>
    </EarlyAccessLayout>
  );
};

export default EarlyAccessLanding;
