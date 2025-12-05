import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Driver Pages
import { Overview } from './pages/driver/Overview';
import { RouteDesigner } from './pages/driver/RouteDesigner';
import { ActiveRoutes } from './pages/driver/ActiveRoutes';
import { Profile } from './pages/driver/Profile';
import { TestStation } from './pages/TestStation';
import { RiderDashboard } from './pages/RiderDashboard';

import { DriverLayout } from './pages/driver/DriverLayout';
import { RiderLayout } from './pages/rider/RiderLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rider Routes */}
          <Route path="/rider" element={
            <RequireAuth allowedRoles={['RIDER']}>
              <RiderLayout />
            </RequireAuth>
          }>
            <Route index element={<RiderDashboard />} />
          </Route>

          {/* Driver Routes */}
          <Route path="/driver" element={
            <RequireAuth allowedRoles={['DRIVER']}>
              <DriverLayout />
            </RequireAuth>
          }>
            <Route index element={<Overview />} />
            <Route path="create-route" element={<RouteDesigner />} />
            <Route path="active-routes" element={<ActiveRoutes />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
