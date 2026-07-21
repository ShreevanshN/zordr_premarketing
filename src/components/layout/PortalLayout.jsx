import { useState } from 'react';
import Sidebar from './sidebar';
import Logo from '../shared/Logo';

const PortalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFA' }}>

      {/* Desktop sidebar */}
      <div className="portal-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className="portal-sidebar-mobile" style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="portal-mobile-topbar" style={{ background: '#fff', borderBottom: '1px solid #EAEAEA', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#111827', display: 'flex', alignItems: 'center' }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo size="sm" />
        </div>

        <main style={{ flex: 1, padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 40px)', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
