import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { HiClipboardList, HiChevronRight } from 'react-icons/hi';
import { galleryService } from '../../services/galleryService';

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [applicationsCount, setApplicationsCount] = useState(0);

  useEffect(() => {    const fetchApplications = async () => {
      try {
        const applications = await galleryService.getArtistApplications();
        const pendingApplications = applications.filter(app => app.status === 'pending');
        setApplicationsCount(pendingApplications.length);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Artists</h3>
          <p className="text-2xl font-bold">0</p>
        </div>

        {/* Applications Card with Button */}
        <div 
          className={`p-6 rounded-xl cursor-pointer transform transition-all duration-200 hover:scale-[1.02] ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => navigate('/admin/applications')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Pending Applications</h3>
            <div className={`p-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-600 text-blue-400' 
                : 'bg-white text-blue-600'
            }`}>
              <HiClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-2">{applicationsCount}</p>
          <div className={`flex items-center text-sm ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            View Applications
            <HiChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Artworks</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
