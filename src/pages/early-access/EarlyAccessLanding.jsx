import { useNavigate } from 'react-router-dom';
import { useCollege } from '../../context/CollegeContext';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';
import heroImage from '../../assets/campus-students-hero.png';
import { handleDownloadNow, detectDevicePlatform } from '../../utils/device';

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
  const pct = total > 0 ? Math.min(Math.round((claimed / total) * 100), 100) : 0;
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
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 20 }}>Skip queues. Order smarter. Save time.</p>

      {/* Image with Progress and Header Overlays */}
      <div style={{ position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <img src={heroImage} alt="Campus students" style={{ width: '100%', display: 'block' }} />
        
        {/* Top Overlay: Become an Early Bird text */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '12px 20px',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🐦</span>
            <span style={{ fontWeight: 800, color: primary, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {remaining <= 0 ? 'Campaign Closed' : 'Become an Early Bird'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
            {remaining <= 0
              ? 'Our Early Bird campaign is now closed. Download the app below to join!'
              : `Be among the first ${total} students to join before launch.`}
          </div>
        </div>

        {/* Bottom Overlay: Progress panel */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '16px 20px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: primary, letterSpacing: '0.08em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔥</span> EARLY BIRDS CLAIMED
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: primary }}>{claimed}</span>
            <span style={{ fontSize: 18, opacity: 0.8 }}>/ {total}</span>
          </div>
          <div style={{ margin: '8px 0 4px', height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: primary, borderRadius: 10 }} />
          </div>
          <span style={{ fontSize: 11, color: primary, fontWeight: 600 }}>{remaining} spots remaining</span>
        </div>
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
        onClick={() => {
          if (remaining <= 0) {
            handleDownloadNow(college?.app_links);
          } else {
            navigate(`/${slug}/signup`);
          }
        }}
        style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        {remaining <= 0 ? '📲 Download Zordr App Now' : '🐦 Become an Early Bird →'}
      </button>



      <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 20 }}>🔒 100% safe. We respect your privacy.</p>
    </EarlyAccessLayout>
  );
};

export default EarlyAccessLanding;
