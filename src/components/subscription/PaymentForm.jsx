import React, { useState } from 'react';

const PaymentForm = ({ selectedPlan, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    billingName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      // Remove non-digits
      const digitsOnly = value.replace(/\D/g, '');
      // Add spaces after every 4 digits
      const formatted = digitsOnly
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim()
        .substring(0, 19); // Limit to 16 digits + 3 spaces
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format expiry date
    if (name === 'cardExpiry') {
      // Remove non-digits
      const digitsOnly = value.replace(/\D/g, '');
      // Format as MM/YY
      let formatted = digitsOnly;
      if (digitsOnly.length > 2) {
        formatted = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}`;
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format CVC to limit to 3-4 digits
    if (name === 'cardCvc') {
      const digitsOnly = value.replace(/\D/g, '').substring(0, 4);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    
    // Handle all other fields
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validate = () => {
    const newErrors = {};
    
    // Card Name
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
    }
    
    // Card Number
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 15) {
      newErrors.cardNumber = 'Card number is too short';
    }
    
    // Card Expiry
    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Invalid format (MM/YY)';
    } else {
      // Check if card is expired
      const [month, year] = formData.cardExpiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const today = new Date();
      if (expiryDate < today) {
        newErrors.cardExpiry = 'Card is expired';
      }
    }
    
    // CVC
    if (!formData.cardCvc.trim()) {
      newErrors.cardCvc = 'CVC is required';
    } else if (formData.cardCvc.length < 3) {
      newErrors.cardCvc = 'CVC is too short';
    }
    
    // Billing information
    if (!formData.billingName.trim()) {
      newErrors.billingName = 'Name is required';
    }
    
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Address is required';
    }
    
    if (!formData.billingCity.trim()) {
      newErrors.billingCity = 'City is required';
    }
    
    if (!formData.billingZip.trim()) {
      newErrors.billingZip = 'ZIP/Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // This is just a UI mockup so we simulate a successful payment after a delay
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 2000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
        <p className="mt-1 text-sm text-gray-500">
          {selectedPlan ? (
            <>You are subscribing to the <strong>{selectedPlan.name}</strong> plan at <strong>${selectedPlan.price}/{selectedPlan.billingPeriod}</strong>.</>
          ) : (
            'Please select a subscription plan.'
          )}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Credit Card Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Method</h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                Name on card
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.cardName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              />
              {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
            </div>
            
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.cardNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              />
              {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                  Expiration date (MM/YY)
                </label>
                <input
                  type="text"
                  id="cardExpiry"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.cardExpiry ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {errors.cardExpiry && <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>}
              </div>
              <div>
                <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                  CVC
                </label>
                <input
                  type="text"
                  id="cardCvc"
                  name="cardCvc"
                  placeholder="000"
                  value={formData.cardCvc}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.cardCvc ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {errors.cardCvc && <p className="mt-1 text-sm text-red-600">{errors.cardCvc}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Billing Address Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Billing Address</h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="billingName" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                id="billingName"
                name="billingName"
                value={formData.billingName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.billingName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              />
              {errors.billingName && <p className="mt-1 text-sm text-red-600">{errors.billingName}</p>}
            </div>
            
            <div>
              <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                Street address
              </label>
              <input
                type="text"
                id="billingAddress"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.billingAddress ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              />
              {errors.billingAddress && <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="billingCity"
                  name="billingCity"
                  value={formData.billingCity}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.billingCity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {errors.billingCity && <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>}
              </div>
              <div>
                <label htmlFor="billingState" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <input
                  type="text"
                  id="billingState"
                  name="billingState"
                  value={formData.billingState}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal code
                </label>
                <input
                  type="text"
                  id="billingZip"
                  name="billingZip"
                  value={formData.billingZip}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.billingZip ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {errors.billingZip && <p className="mt-1 text-sm text-red-600">{errors.billingZip}</p>}
              </div>
              <div>
                <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="billingCountry"
                  name="billingCountry"
                  value={formData.billingCountry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Order Summary</h4>
          <div className="flex justify-between">
            <span>{selectedPlan?.name} Subscription</span>
            <span>${selectedPlan?.price}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${selectedPlan?.price}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedPlan}
            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
              ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;