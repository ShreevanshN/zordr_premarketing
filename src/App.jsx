import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initSeedData } from './data/seed';
import ProtectedRoute from './routes/ProtectedRoute';
import { CollegeProvider } from './context/CollegeContext';
import CollegeGate from './components/shared/CollegeGate';

import EarlyAccessLanding from './pages/early-access/EarlyAccessLanding';
import EarlyAccessSignup from './pages/early-access/EarlyAccessSignup';
import RewardCards from './pages/early-access/RewardCards';
import EarlyAccessSuccess from './pages/early-access/EarlyAccessSuccess';
import CampusInsider from './pages/early-access/CampusInsider';
import Login from './pages/Login';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
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
  useEffect(() => {
    // Legacy localStorage seed for the Employee Portal (Insider login),
    // which is being finished in a later phase. Not used by the
    // college-scoped pre-launch funnel anymore -- that reads from Supabase.
    initSeedData();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kitsw" replace />} />

      {/* College-scoped pre-launch growth funnel: /:collegeSlug/... */}
      <Route path="/:collegeSlug" element={<CollegeScope><EarlyAccessLanding /></CollegeScope>} />
      <Route path="/:collegeSlug/signup" element={<CollegeScope><EarlyAccessSignup /></CollegeScope>} />
      <Route path="/:collegeSlug/reward" element={<CollegeScope><RewardCards /></CollegeScope>} />
      <Route path="/:collegeSlug/success" element={<CollegeScope><EarlyAccessSuccess /></CollegeScope>} />
      <Route path="/:collegeSlug/campus-insider" element={<CollegeScope><CampusInsider /></CollegeScope>} />

      {/* Employee / Insider Portal -- college-agnostic, finished in a later phase */}
      <Route path="/employee/login" element={<Login />} />
      <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />

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
