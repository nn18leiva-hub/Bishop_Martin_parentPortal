import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './layouts/AdminLayout';
import StaffDashboard from './pages/StaffDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SharedLayout from './layouts/SharedLayout';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Administrative Routes */}
          <Route path="/staff" element={<AdminLayout />}>
            <Route index element={<StaffDashboard />} />
          </Route>
          
          <Route path="/superadmin" element={<AdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
          </Route>
          
          {/* Shared Settings & Help Routes */}
          <Route element={<SharedLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<ComingSoon />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
