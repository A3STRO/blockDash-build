import React, { useState } from 'react';
import { portfolioAPI } from '../../services/api';

const AddressForm = ({ onAddressAdded }) => {
  const [formData, setFormData] = useState({
    blockchain: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const blockchains = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)', placeholder: 'e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { value: 'ethereum', label: 'Ethereum (ETH)', placeholder: 'e.g., 0x742d35Cc6634C0532925a3b8D4C9db96' },
    { value: 'dogecoin', label: 'Dogecoin (DOGE)', placeholder: 'e.g., DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L' },
    { value: 'litecoin', label: 'Litecoin (LTC)', placeholder: 'e.g., LdP8Qox1VAhCzLJNqrr74YovaWYyNBUWvL' },
    { value: 'bitcoin-cash', label: 'Bitcoin Cash (BCH)', placeholder: 'e.g., 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.blockchain || !formData.address) {
      setError('Please select a blockchain and enter an address');
      setLoading(false);
      return;
    }

    try {
      await portfolioAPI.addAddress(formData);
      setSuccess('Address added successfully!');
      setFormData({ blockchain: '', address: '' });
      
      // Call the callback to refresh portfolio
      if (onAddressAdded) {
        onAddressAdded();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const selectedBlockchain = blockchains.find(b => b.value === formData.blockchain);

  return (
    <div className="clean-card p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Add New Address</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="blockchain" className="block text-sm font-medium text-gray-700 mb-2">
              Blockchain Network
            </label>
            <select
              id="blockchain"
              name="blockchain"
              value={formData.blockchain}
              onChange={handleChange}
              className="w-full px-4 py-3 clean-input text-gray-900"
              required
            >
              <option value="" disabled>Select a blockchain</option>
              {blockchains.map((blockchain) => (
                <option key={blockchain.value} value={blockchain.value}>
                  {blockchain.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder={selectedBlockchain?.placeholder || 'Enter wallet address'}
              className="w-full px-4 py-3 clean-input text-gray-900 placeholder-gray-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 clean-button text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Adding Address...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Address
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How to find your wallet address:</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                For most wallets, look for "Receive" or "Deposit" option
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Copy the public address (never share your private key)
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Make sure the address matches the selected blockchain
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
