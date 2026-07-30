import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';
import { useCollege } from '../../context/CollegeContext';
import { getStudentSession } from '../../services/studentService';
import { FaApple, FaChevronRight, FaRegCopy, FaCheck } from 'react-icons/fa';

const IOSLaunchStatus = () => {
  const navigate = useNavigate();
  const { college, slug } = useCollege();
  const primary = college?.theme?.primary || '#FF5A1F';
  const session = getStudentSession(slug);
  const [copied, setCopied] = useState(false);

  const couponCode = session?.couponCode || 'RESERVED';
  const rewardTitle = session?.rewardTitle || 'Mystery Reward';
  const rewardDescription = session?.rewardDescription || 'Exclusive launch perk';

  const copyCode = () => {
    if (session?.couponCode) {
      navigator.clipboard.writeText(session.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <EarlyAccessLayout>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {/* Apple Store status icon container */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '24%',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
        }}>
          <FaApple size={36} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Apple App Store status
        </p>
        <h1 style={{ fontSize: 'clamp(22px, 6vw, 26px)', fontWeight: 800, color: '#111827', lineHeight: 1.25 }}>
          iOS App Launching Soon!
        </h1>
      </div>

      {/* Info card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #EAEAEA',
        borderRadius: 20,
        padding: '24px 20px',
        marginBottom: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      }}>
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, textAlign: 'center', marginBottom: 20 }}>
          Our application is currently undergoing review by the Apple App Store team. We'll be live in just a few days!
        </p>

        <div style={{
          background: `linear-gradient(150deg, ${primary} 0%, ${primary}DD 100%)`,
          borderRadius: 16,
          padding: '20px 16px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: `0 8px 24px ${primary}30`,
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', opacity: 0.9, textTransform: 'uppercase', marginBottom: 6 }}>
            🎁 Your Reward is Locked & Ready
          </p>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 2, textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            {rewardTitle}
          </div>
          <p style={{ fontSize: 11, opacity: 0.9, marginBottom: 14 }}>
            {rewardDescription}
          </p>

          <div
            onClick={copyCode}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1.5px dashed rgba(255, 255, 255, 0.5)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: 220,
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.05em' }}>{couponCode}</span>
            {copied ? <FaCheck size={13} color="#22C55E" /> : <FaRegCopy size={13} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#F9FAFB', borderRadius: 12, padding: 12 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
            Don't worry—you won't lose this! We will send you a WhatsApp notification the moment the iOS app goes live so you can log in and claim your coupon.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <button
        onClick={() => navigate(`/${slug}/success`)}
        style={{
          width: '100%',
          background: primary,
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '16px',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: `0 4px 16px ${primary}35`,
        }}
      >
        <span>Go to Referral Dashboard</span>
        <FaChevronRight size={12} />
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
        🔒 Coupon code linked to your phone number
      </p>
    </EarlyAccessLayout>
  );
};

export default IOSLaunchStatus;
