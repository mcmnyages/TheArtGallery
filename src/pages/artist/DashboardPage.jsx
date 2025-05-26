import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Artist Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Total Artworks</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-green-600">$0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Active Exhibitions</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>

          {/* Quick Actions */}
          <div className="col-span-full mt-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/artist/upload')}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload New Artwork
              </button>
              <button
                onClick={() => navigate('/artist/gallery')}
                className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Manage Gallery
              </button>
              <button
                onClick={() => navigate('/artist/exhibitions')}
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Exhibition
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
