import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { session, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminProtectedRoute;
