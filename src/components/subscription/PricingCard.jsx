import React from 'react';
import { Link } from 'react-router-dom';

const PricingCard = ({ plan, isActive = false, onSelect }) => {
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
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 
      ${isActive ? 'ring-2 ring-blue-500' : ''} 
      ${popularChoice ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
    >
      {/* Popular choice badge */}
      {popularChoice && (
        <div className="bg-blue-500 text-white text-center py-1 px-4 font-medium text-sm">
          Most Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold text-gray-900">{currency}{price}</span>
          <span className="ml-1 text-xl font-medium text-gray-500">/{billingPeriod}</span>
        </div>
        
        <p className="mt-5 text-gray-500">{description}</p>
        
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">{feature}</p>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          {isActive ? (
            <div className="flex flex-col space-y-3">
              <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100">
                Current Plan
              </span>
              <Link 
                to="/account" 
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Manage Subscription
              </Link>
            </div>
          ) : (
            <button
              onClick={() => onSelect(id)}
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;