import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import QRScanner from './pages/QRScanner';
import CoachDashboard from './pages/CoachDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import CoachRoute from './components/CoachRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Staff Routes */}
      <Route element={<StaffRoute />}>
        <Route path="/scanner" element={<QRScanner />} />
      </Route>

      {/* Coach Routes */}
      <Route element={<CoachRoute />}>
        <Route path="/coach" element={<CoachDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
