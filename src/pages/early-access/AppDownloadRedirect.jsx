import { useEffect, useState } from 'react';
import { detectDevicePlatform } from '../../utils/device';
import { FaApple, FaAndroid, FaGooglePlay } from 'react-icons/fa';
import logoImg from '../../assets/zordr-logo.png';

const AppDownloadRedirect = () => {
  const [platform, setPlatform] = useState('android');

  const iosUrl = 'https://apps.apple.com/in/app/zordr-campus-food-ordering/id6775477121';
  const androidUrl = 'https://play.google.com/store/apps/details?id=com.zordr.app&hl=en_IN';

  useEffect(() => {
    const detected = detectDevicePlatform();
    setPlatform(detected);
    const url = detected === 'ios' ? iosUrl : androidUrl;

    const timer = setTimeout(() => {
      window.location.replace(url);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleManualClick = () => {
    const url = platform === 'ios' ? iosUrl : androidUrl;
    window.location.replace(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '"Outfit", "Inter", sans-serif',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 28,
        padding: '40px 32px',
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        boxSizing: 'border-box',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <img src={logoImg} alt="Zordr Logo" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#FF5A1F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>App</span>
        </div>

        {/* Store Icon with spinner ring */}
        <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 28px' }}>
          {/* Animated Spinner Ring */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            border: '3px solid rgba(255, 90, 31, 0.1)',
            borderTop: '3px solid #FF5A1F',
            animation: 'spin 1.2s linear infinite',
          }} />
          
          {/* Center Icon */}
          <div style={{
            position: 'absolute',
            top: '5%',
            left: '5%',
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {platform === 'ios' ? (
              <FaApple size={40} color="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.15))' }} />
            ) : (
              <FaGooglePlay size={34} color="#FF5A1F" style={{ marginLeft: 2 }} />
            )}
          </div>
        </div>

        {/* Redirect text */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#FFFFFF' }}>
          Redirecting...
        </h2>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.5, marginBottom: 32 }}>
          Detecting your platform and opening the {platform === 'ios' ? 'Apple App Store' : 'Google Play Store'}.
        </p>

        {/* Fallback button */}
        <button
          onClick={handleManualClick}
          style={{
            width: '100%',
            background: '#FF5A1F',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 16,
            padding: '16px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(255, 90, 31, 0.25)',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.background = '#FF6B35';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#FF5A1F';
          }}
        >
          {platform === 'ios' ? <FaApple size={18} /> : <FaAndroid size={18} />}
          <span>Open Store Manually</span>
        </button>
      </div>

      {/* Global CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AppDownloadRedirect;
