import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { HiCheck, HiX, HiClock } from 'react-icons/hi';
import { getArtistApplications } from '../../services/galleryService';
import { format } from 'date-fns';

const ApplicationsManagement = () => {
  const { isDarkMode } = useTheme();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {    const fetchApplications = async () => {
      try {
        const response = await getArtistApplications();
        console.log('API Response:', response); // Debug log

        // Ensure we have an array of applications
        if (!Array.isArray(response)) {
          throw new Error('Expected array of applications, got: ' + typeof response);
        }

        // Transform the data to match our component's needs
        const transformedData = response.map(app => ({
          id: app.email, // Using email as ID since we don't have a specific ID
          email: app.email,
          submittedAt: format(new Date(app.appliedAt), 'yyyy-MM-dd HH:mm'),
          status: 'pending', // Default status
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

  const handleApprove = async (id) => {
    // TODO: Implement approval API call
    console.log('Approving application:', id);
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
        <h1 className="text-3xl font-bold">Applications Management</h1>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Total: {applications.length} application(s)
        </div>
      </div>

      {applications.length === 0 ? (
        <div className={`p-6 rounded-xl text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          No applications found
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`overflow-x-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {application.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {application.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(application.status)
                      }`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-2 capitalize">{application.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {application.submittedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(application.id)}
                              className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                                isDarkMode
                                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(application.id)}
                              className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                                isDarkMode
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement;
