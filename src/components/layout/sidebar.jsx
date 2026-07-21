import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../shared/Logo';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500,
    color: isActive ? '#FF5A1F' : '#6B7280',
    background: isActive ? '#FFF6F2' : 'transparent',
  });

  return (
    <aside style={{ width: 220, minHeight: '100%', borderRight: '1px solid #EAEAEA', background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6B7280', padding: 4 }}>✕</button>
        )}
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavLink to="/departments" onClick={onClose} style={({ isActive }) => linkStyle(isActive)}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Departments
        </NavLink>
        <NavLink to="/employees" onClick={onClose} style={({ isActive }) => linkStyle(isActive)}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Insiders
        </NavLink>
      </nav>

      <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ padding: '10px 12px', fontSize: 13, color: '#6B7280' }}>
          <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{user?.name}</div>
          <div style={{ marginTop: 2 }}>{user?.role}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, fontWeight: 500 }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
