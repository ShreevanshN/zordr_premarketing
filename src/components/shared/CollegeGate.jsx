import { useCollege } from '../../context/CollegeContext';

const wrapStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: 24,
  textAlign: 'center',
  background: '#FAFAFA',
  fontFamily: 'Inter, sans-serif',
};

/**
 * Renders children only once the college for the current :collegeSlug has
 * loaded successfully. Handles the loading / not-found / error states in
 * one place so every page doesn't have to.
 */
const CollegeGate = ({ children }) => {
  const { status, slug, error, reload } = useCollege();

  if (status === 'loading') {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          <span style={{ color: '#FF5A1F' }}>Z</span>ordr
        </div>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Loading campaign…</p>
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: 40 }}>🎒</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>
          We couldn't find a campaign for "{slug}"
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, maxWidth: 360 }}>
          Double-check the link, or ask your Zordr campus contact for the right one.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Something went wrong</h1>
        <p style={{ color: '#6B7280', fontSize: 13, maxWidth: 360 }}>{error}</p>
        <button
          onClick={reload}
          style={{ background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    );
  }

  return children;
};

export default CollegeGate;
