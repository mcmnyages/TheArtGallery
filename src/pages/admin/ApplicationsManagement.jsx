import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { HiCheck, HiX, HiClock } from 'react-icons/hi';
import { galleryService } from '../../services/galleryService';
import { authService } from '../../services/authService';
import { format } from 'date-fns';
import { useMessage } from '../../hooks/useMessage';

const ApplicationsManagement = () => {  const { isDarkMode } = useTheme();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artworkResource, setArtworkResource] = useState(null);
  const { addMessage } = useMessage();
  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  // Fetch the Artwork resource on component mount
  useEffect(() => {
    const fetchArtworkResource = async () => {
      try {
        const resources = await authService.getAllResources();
        console.log('📦 All resources:', resources);
        const artwork = resources.find(r => r.name === 'Artwork');
        if (!artwork) {
          throw new Error('Artwork resource not found');
        }
        console.log('🎨 Found Artwork resource:', artwork);
        setArtworkResource(artwork);
      } catch (err) {
        console.error('❌ Failed to get Artwork resource:', err);
        addMessage({
          type: 'error',
          text: 'Failed to load Artwork resource'
        });
      }
    };

    fetchArtworkResource();
  }, [addMessage]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await galleryService.getArtistApplications();
        console.log('API Response:', response);

        if (!Array.isArray(response)) {
          throw new Error('Expected array of applications, got: ' + typeof response);
        }
        
        const transformedData = response.map(app => ({
          id: app.email,
          email: app.email,
          submittedAt: format(new Date(app.appliedAt), 'yyyy-MM-dd HH:mm'),
          status: app.status || 'pending',
          type: 'Artist'
        }));

        console.log('Transformed data:', transformedData);
        setApplications(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to load applications. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return isDarkMode 
          ? 'text-green-400 bg-green-500/10' 
          : 'text-green-700 bg-green-50';
      case 'rejected':
        return isDarkMode 
          ? 'text-red-400 bg-red-500/10' 
          : 'text-red-700 bg-red-50';
      default:
        return isDarkMode 
          ? 'text-yellow-400 bg-yellow-500/10' 
          : 'text-yellow-700 bg-yellow-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <HiCheck className="w-5 h-5" />;
      case 'rejected':
        return <HiX className="w-5 h-5" />;
      default:
        return <HiClock className="w-5 h-5" />;
    }
  };
  const handleApprove = async (email) => {
    try {
      if (!artworkResource) {
        throw new Error('Artwork resource not available');
      }
        // First, add the policy
      await authService.addPolicy(email, artworkResource.name, 'read');
      
      // Then, approve the application
      console.log('✍️ Approving:', { email, resource: artworkResource.name });
      const response = await galleryService.approveArtistApplication(email);
      console.log('✅ Approved:', response);

      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.email === email 
            ? { ...app, status: 'approved', resource: 'Artwork' }
            : app
        )
      );
      
      addMessage({
        type: 'success',
        text: `Artist application approved successfully with ${artworkResource.name} role`
      });
    } catch (error) {
      console.error('Failed to approve artist application:', error);
      addMessage({
        type: 'error',
        text: error.message || 'Failed to approve artist application'
      });
    }
  };

  const handleReject = async (id) => {
    // TODO: Implement rejection API call
    console.log('Rejecting application:', id);
  };
  if (isLoading || !artworkResource) {
    return (
      <div className={`p-6 flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading {isLoading ? 'applications' : 'Artwork resource'}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'}`}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xl font-semibold">
            Artist Applications ({filteredApplications.length})
          </div>
          {artworkResource && (
            <div className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              Using resource: {artworkResource.name} (ID: {artworkResource._id})
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="statusFilter" className="text-sm">Filter by status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-1 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <table className="min-w-full divide-y">
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Applied At</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredApplications.map((application, index) => (
              <tr key={index} className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {application.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {application.submittedAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(application.status)
                  }`}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1">
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </span>
                </td>                <td className="px-6 py-4 whitespace-nowrap">
                  {application.status === 'pending' && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">                        <button
                          onClick={() => handleApprove(application.email)}
                          className="inline-flex items-center px-3 py-1.5 border border-green-600 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          title={`Approve as ${artworkResource?.name || 'Artwork'} artist`}
                        >
                          <HiCheck className="h-4 w-4 mr-1" />
                          Approve as {artworkResource?.name || 'Artwork'}
                        </button>
                        <button
                          onClick={() => handleReject(application.email)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          title="Reject application"
                        >
                          <HiX className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsManagement;
