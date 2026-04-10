import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import BankDetails from './pages/BankDetails';
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
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Parent Portal Routes */}
          <Route path="/dashboard/parents" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewRequest />} />
            <Route path="bank-details" element={<BankDetails />} />
          </Route>
          
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
