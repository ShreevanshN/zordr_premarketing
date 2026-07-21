import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/shared/Logo';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(form.email, form.password);
    if (result.success) navigate('/departments');
    else setError(result.error);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Mobile-only header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAEAEA', display: 'block' }} className="mobile-header">
        <Logo />
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left panel - always visible */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(24px, 5vw, 48px)', maxWidth: 480, justifyContent: 'center', margin: '0 auto', width: '100%' }}>

          {/* Desktop logo */}
          <div style={{ marginBottom: 40 }} className="desktop-logo">
            <Logo />
          </div>

          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, marginBottom: 6 }}>Welcome back!</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Sign in to your employee portal</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #EAEAEA', borderRadius: 12, padding: '14px 16px', background: '#fff' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, color: '#111827', background: 'transparent' }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #EAEAEA', borderRadius: 12, padding: '14px 16px', background: '#fff' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, color: '#111827', background: 'transparent' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button type="submit" style={{ width: '100%', background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Sign In
            </button>
          </form>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Authorized employees only. All activities are monitored and secure.
          </div>

          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 32 }}>© 2024 Zordr. All rights reserved.</p>
        </div>

        {/* Right panel - hidden on mobile */}
        <div className="login-right-panel" style={{ flex: 1, background: '#FFF6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', textAlign: 'center', lineHeight: 1.3 }}>
            Let's build<br />the future,<br />
            <span style={{ color: '#FF5A1F' }}>together.</span>
          </h2>
          <div style={{ marginTop: 16, background: '#FFE8D6', borderRadius: 20, padding: '32px 48px', textAlign: 'center' }}>
            <div style={{ fontSize: 80 }}>👥</div>
            <p style={{ fontSize: 13, color: '#FF5A1F', fontWeight: 600, marginTop: 8 }}>Your team awaits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
