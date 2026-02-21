import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { canAccess } from './context/permissions';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';

/** Redirect unauthenticated users to landing */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/landing" replace />;
};

/** Redirect authenticated users away from public pages */
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
};

/**
 * Guards a page by role.
 * If the logged-in user's role doesn't have access to `path`,
 * redirect to dashboard silently.
 */
const RoleRoute = ({ path, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/landing" replace />;
  return canAccess(user.role, path) ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

    {/* Private app shell */}
    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
      {/* Dashboard — all roles */}
      <Route index element={<Dashboard />} />

      {/* manager | dispatcher | safetyOfficer */}
      <Route path="vehicles" element={<RoleRoute path="/vehicles"><VehiclesPage /></RoleRoute>} />
      <Route path="drivers" element={<RoleRoute path="/drivers"><DriversPage /></RoleRoute>} />

      {/* manager | dispatcher */}
      <Route path="trips" element={<RoleRoute path="/trips"><TripsPage /></RoleRoute>} />

      {/* manager | dispatcher | safetyOfficer */}
      <Route path="maintenance" element={<RoleRoute path="/maintenance"><MaintenancePage /></RoleRoute>} />

      {/* manager | finance */}
      <Route path="expenses" element={<RoleRoute path="/expenses"><ExpensesPage /></RoleRoute>} />

      {/* all roles */}
      <Route path="analytics" element={<RoleRoute path="/analytics"><AnalyticsPage /></RoleRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
