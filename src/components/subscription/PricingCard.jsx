import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const PricingCard = ({ plan, isActive = false, onSelect }) => {
  const { isDarkMode } = useTheme();
  const {
    id,
    name,
    price,
    billingPeriod,
    description,
    features,
    popularChoice = false,
    currency = '$'
  } = plan;

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      ${isActive 
        ? isDarkMode 
          ? 'ring-2 ring-purple-500' 
          : 'ring-2 ring-blue-500'
        : ''} 
      ${popularChoice 
        ? isDarkMode
          ? 'border-2 border-purple-500'
          : 'border-2 border-blue-500'
        : isDarkMode
          ? 'border border-gray-700'
          : 'border border-gray-200'}`}
    >
      {/* Popular choice badge */}
      {popularChoice && (
        <div className={`text-white text-center py-1 px-4 font-medium text-sm ${
          isDarkMode ? 'bg-purple-600' : 'bg-blue-500'
        }`}>
          Most Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className={`text-xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className={`text-4xl font-extrabold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{currency}{price}</span>
          <span className={`ml-2 text-base ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>/{billingPeriod}</span>
        </div>
        
        <p className={`mt-4 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>{description}</p>
        
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className={`flex-shrink-0 h-5 w-5 ${
                isDarkMode ? 'text-purple-400' : 'text-blue-500'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span className={`ml-2 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>{feature}</span>
            </li>
          ))}
        </ul>
        
        <button
          onClick={() => onSelect(id)}
          className={`mt-8 w-full rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
            isDarkMode
              ? isActive
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-700 text-white hover:bg-gray-600'
              : isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
        >
          {isActive ? 'Current Plan' : 'Select Plan'}
        </button>
      </div>
    </div>
  );
};

export default PricingCard;