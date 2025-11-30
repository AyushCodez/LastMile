import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Driver Pages
import { DriverHomePage } from './pages/driver/DriverHome';
import { DriverProfilePage } from './pages/driver/DriverProfile';
import { RouteManagerPage } from './pages/driver/RouteManager';
import { ActiveRoutePage } from './pages/driver/ActiveRoute';

// Rider Pages
import { RiderHomePage } from './pages/rider/RiderHome';
import { RequestRidePage } from './pages/rider/RequestRide';
import { RideHistoryPage } from './pages/rider/RideHistory';

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
            <Route index element={<RiderHomePage />} />
            <Route path="request" element={<RequestRidePage />} />
            <Route path="history" element={<RideHistoryPage />} />
          </Route>

          {/* Driver Routes */}
          <Route path="/driver" element={
            <RequireAuth allowedRoles={['DRIVER']}>
              <DriverLayout />
            </RequireAuth>
          }>
            <Route index element={<DriverHomePage />} />
            <Route path="routes" element={<RouteManagerPage />} />
            <Route path="active" element={<ActiveRoutePage />} />
            <Route path="profile" element={<DriverProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
