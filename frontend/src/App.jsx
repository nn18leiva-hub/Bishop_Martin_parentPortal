import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import StaffDashboard from './pages/StaffDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard/parents" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewRequest />} />
          </Route>
          
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
