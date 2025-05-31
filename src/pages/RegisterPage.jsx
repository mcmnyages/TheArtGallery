import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { useTheme } from '../contexts/ThemeContext';

const RegisterPage = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full ${
        isDarkMode ? 'bg-gray-800 shadow-lg shadow-gray-700/20' : ''
      }`}>
        <div className="mb-8">
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;