import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: loginError } = await login(email, password);
    setSubmitting(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    navigate('/admin');
  };

  const inputStyle = {
    width: '100%', border: '1px solid #EAEAEA', borderRadius: 12,
    padding: '13px 16px', fontSize: 14, color: '#111827', background: '#fff',
    outline: 'none', marginBottom: 12, boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: 340, background: '#fff', border: '1px solid #EAEAEA', borderRadius: 20, padding: 32 }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          <span style={{ color: '#FF5A1F' }}>Z</span>ordr Admin
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Campaign configuration console</p>

        <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ width: '100%', background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
          Admin accounts are created manually in Supabase — see PHASE5_NOTES.md.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
