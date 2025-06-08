import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { HiCheck, HiX, HiClock } from 'react-icons/hi';

const ApplicationsManagement = () => {
  const { isDarkMode } = useTheme();
  // This would come from your API in a real application
  const [applications] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      type: 'Artist',
      status: 'pending',
      submittedAt: '2025-06-07',
      portfolio: 'https://portfolio.example.com/john',
      description: 'Contemporary artist with 5 years of experience...'
    },
    // Add more mock data as needed
  ]);

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

  const handleApprove = (id) => {
    // Implement approval logic
    console.log('Approving application:', id);
  };

  const handleReject = (id) => {
    // Implement rejection logic
    console.log('Rejecting application:', id);
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Applications Management</h1>
      </div>

      {/* Applications List */}
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
                      <div className="font-medium">{application.name}</div>
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
    </div>
  );
};

export default ApplicationsManagement;
