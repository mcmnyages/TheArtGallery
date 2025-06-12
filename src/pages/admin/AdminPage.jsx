import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import ArtistsManagement from './ArtistsManagement';
import ApplicationsManagement from './ApplicationsManagement';
import  SubscribersPage from './SubscribersPage';
const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="artists" element={<ArtistsManagement />} />
        <Route path="allsubscribers" element={<SubscribersPage />} />
        <Route path="artworks" element={<div>Artworks Management</div>} />
        <Route path="applications" element={<ApplicationsManagement />} />
        <Route path="settings" element={<div>Admin Settings</div>} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
