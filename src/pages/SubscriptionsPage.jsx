import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchSubscriptionPlans, processSubscriptionPayment } from '../services/api';

const SubscriptionsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const plansData = await fetchSubscriptionPlans();
        setPlans(plansData);
      } catch (err) {
        console.error('Error loading subscription plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
    // Scroll to checkout form
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      return;
    }
    
    try {
      setPaymentStatus('processing');
      setPaymentError('');
      
      // Simulating payment processing
      const paymentData = {
        planId: selectedPlan.id,
        autoRenew: true,
        // In a real app, this would include credit card details, etc.
      };
      
      const result = await processSubscriptionPayment(paymentData);
      
      if (result.success) {
        setPaymentStatus('success');
      } else {
        throw new Error('Payment processing failed');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('error');
      setPaymentError(err.message || 'There was a problem processing your payment. Please try again.');
    }
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    setPaymentStatus('idle');
    setPaymentError('');
  };

  const getCurrentSubscription = () => {
    // In a real app, this would fetch the user's current subscription
    return user?.subscription || { plan: 'free', status: 'none' };
  };

  const currentSubscription = getCurrentSubscription();
  const hasActiveSubscription = currentSubscription.status === 'active' && currentSubscription.plan !== 'free';

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
        <p className="text-gray-600">Choose the plan that fits your needs</p>
      </div>

      {/* Current subscription status */}
      {isAuthenticated && (
        <div className={`p-6 rounded-lg shadow-md ${hasActiveSubscription ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <h2 className="text-xl font-semibold mb-2">Your Subscription</h2>
          {hasActiveSubscription ? (
            <div>
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium text-green-700">Active</span>
              </div>
              <p className="text-gray-700">
                You're currently on the <span className="font-medium capitalize">{currentSubscription.plan}</span> plan.
                {currentSubscription.expiresAt && (
                  <span> Your subscription renews on {new Date(currentSubscription.expiresAt).toLocaleDateString()}.</span>
                )}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700">You don't have an active subscription plan yet. Choose from our options below.</p>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription plans */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-lg border overflow-hidden shadow transition-shadow hover:shadow-lg ${
                plan.popular ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-center py-1">
                  <span className="text-xs uppercase tracking-wide font-medium text-white">Most Popular</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-3xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-xl font-semibold">/{plan.interval}</span>
                </div>
                <p className="mt-4 text-gray-500">{plan.description}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentSubscription.plan === plan.id}
                    className={`w-full py-3 px-4 rounded-md shadow text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      currentSubscription.plan === plan.id
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
                    }`}
                  >
                    {currentSubscription.plan === plan.id ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout section */}
      {showCheckout && (
        <div id="checkout-section" className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mt-10">
          {paymentStatus === 'success' ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900">Payment Successful!</h2>
              <p className="mt-2 text-gray-600">
                Thank you for subscribing to our {selectedPlan?.name} plan. You now have access to all features included in this plan.
              </p>
              <div className="mt-8">
                <button
                  onClick={resetCheckout}
                  className="bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Subscription</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPlan?.name} Plan</h3>
                    <p className="text-gray-600">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">${selectedPlan?.price}</span>
                    <span className="text-gray-500">/{selectedPlan?.interval}</span>
                  </div>
                </div>
              </div>
              
              {paymentStatus === 'error' && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{paymentError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmitPayment}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Name on card
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        placeholder="Jane Smith"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="expDate" className="block text-sm font-medium text-gray-700">
                        Expiration date
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="expDate"
                          name="expDate"
                          placeholder="MM/YY"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                        CVC/CVV
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="cvc"
                          name="cvc"
                          placeholder="123"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="autoRenew"
                      name="autoRenew"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoRenew" className="ml-2 block text-sm text-gray-900">
                      Auto-renew my subscription
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={resetCheckout}
                    className="border border-gray-300 bg-white py-2 px-4 rounded shadow hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentStatus === 'processing'}
                    className={`bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700 ${
                      paymentStatus === 'processing' ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {paymentStatus === 'processing' ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Complete Purchase'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;