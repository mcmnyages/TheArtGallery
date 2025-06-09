import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { HiCheck, HiX, HiClock } from 'react-icons/hi';
import { galleryService } from '../../services/galleryService';
import { format } from 'date-fns';
import { useMessage } from '../../hooks/useMessage';

const ApplicationsManagement = () => {
  const { isDarkMode } = useTheme();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // Default filter is pending
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addMessage } = useMessage();

  // Filter applications based on selected status
  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await galleryService.getArtistApplications();
        console.log('API Response:', response); // Debug log

        // Ensure we have an array of applications
        if (!Array.isArray(response)) {
          throw new Error('Expected array of applications, got: ' + typeof response);
        }        // Transform the data to match our component's needs
        const transformedData = response.map(app => ({
          id: app.email, // Using email as ID since we don't have a specific ID
          email: app.email,
          submittedAt: format(new Date(app.appliedAt), 'yyyy-MM-dd HH:mm'),
          status: app.status || 'pending', // Use status from API or default to pending
          type: 'Artist'
        }));

        console.log('Transformed data:', transformedData); // Debug log
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
      console.log('Approving artist application for:', email);
      const response = await galleryService.approveArtistApplication(email);
      
      // Update the local state to reflect the change
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.email === email 
            ? { ...app, status: 'approved' }
            : app
        )
      );
      
      addMessage({
        type: 'success',
        text: response.message || 'Artist application approved successfully'
      });
      
      console.log('Successfully approved artist application:', response);
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

  if (isLoading) {
    return (
      <div className={`p-6 flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading applications...</span>
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
    <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-semibold">
          Artist Applications ({filteredApplications.length})
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

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
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
                      application.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : application.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status === 'approved' && <HiCheck className="mr-1" />}
                      {application.status === 'rejected' && <HiX className="mr-1" />}
                      {application.status === 'pending' && <HiClock className="mr-1" />}
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(application.email)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve application"
                        >
                          <HiCheck className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(application.email)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject application"
                        >
                          <HiX className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement;
