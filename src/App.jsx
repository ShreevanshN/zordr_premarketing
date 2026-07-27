import { Routes, Route, Navigate } from 'react-router-dom';
import { CollegeProvider } from './context/CollegeContext';
import CollegeGate from './components/shared/CollegeGate';

import EarlyAccessLanding from './pages/early-access/EarlyAccessLanding';
import EarlyAccessSignup from './pages/early-access/EarlyAccessSignup';
import RewardCards from './pages/early-access/RewardCards';
import EarlyAccessSuccess from './pages/early-access/EarlyAccessSuccess';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminConsole from './pages/admin/AdminConsole';

// Wraps every college-scoped page: loads /:collegeSlug into context, then
// gates rendering until it's ready. Keeps each page free of loading logic.
const CollegeScope = ({ children }) => (
  <CollegeProvider>
    <CollegeGate>{children}</CollegeGate>
  </CollegeProvider>
);

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kitsw" replace />} />

      {/* College-scoped pre-launch growth funnel: /:collegeSlug/... */}
      <Route path="/:collegeSlug" element={<CollegeScope><EarlyAccessLanding /></CollegeScope>} />
      <Route path="/:collegeSlug/signup" element={<CollegeScope><EarlyAccessSignup /></CollegeScope>} />
      <Route path="/:collegeSlug/reward" element={<CollegeScope><RewardCards /></CollegeScope>} />
      <Route path="/:collegeSlug/success" element={<CollegeScope><EarlyAccessSuccess /></CollegeScope>} />

      {/* Admin console -- real Supabase Auth, separate from the Employee Portal above */}
      <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
      <Route
        path="/admin"
        element={
          <AdminAuthProvider>
            <AdminProtectedRoute>
              <AdminConsole />
            </AdminProtectedRoute>
          </AdminAuthProvider>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/kitsw" replace />} />
    </Routes>
  );
}

export default App;
