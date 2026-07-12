import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import BankDetails from './pages/BankDetails';
import StaffDashboard from './pages/StaffDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OversightDashboard from './pages/OversightDashboard';
import UserDirectory from './pages/UserDirectory';
import SharedLayout from './layouts/SharedLayout';
import Profile from './pages/Profile';
import Verification from './pages/Verification';
import ComingSoon from './pages/ComingSoon';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ThemeLanguageProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Parent Portal Routes */}
          <Route path="/dashboard/parents" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewRequest />} />
            <Route path="bank-details" element={<BankDetails />} />
            <Route path="documents" element={<ComingSoon />} />
            <Route path="approval" element={<ComingSoon />} />
            <Route path="staff-directory" element={<ComingSoon />} />
            <Route path="archive" element={<ComingSoon />} />
            <Route path="records" element={<ComingSoon />} />
            <Route path="verification" element={<Verification />} />
            <Route path="users" element={<Profile />} />
          </Route>
          
          {/* Administrative Routes - Staff */}
          <Route path="/staff" element={<AdminLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="requests" element={<StaffDashboard />} />
            <Route path="approval" element={<StaffDashboard />} />
            <Route path="archive" element={<StaffDashboard />} />
            <Route path="staff-directory" element={<SuperAdminDashboard />} />
            <Route path="verification" element={<ComingSoon />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="settings" element={<SuperAdminDashboard />} />
          </Route>

          {/* Administrative Routes - Super Admin */}
          <Route path="/superadmin" element={<AdminLayout />}>
            <Route index element={<OversightDashboard />} />
            <Route path="requests" element={<StaffDashboard />} />
            <Route path="approval" element={<StaffDashboard />} />
            <Route path="archive" element={<StaffDashboard />} />
            <Route path="staff-directory" element={<SuperAdminDashboard />} />
            <Route path="verification" element={<ComingSoon />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="settings" element={<SuperAdminDashboard />} />
          </Route>
          
          {/* Shared Settings & Help Routes */}
          <Route element={<SharedLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<ComingSoon />} />
          </Route>
        </Routes>
      </Router>
      </ThemeLanguageProvider>
    </AuthProvider>
  );
}

export default App;
