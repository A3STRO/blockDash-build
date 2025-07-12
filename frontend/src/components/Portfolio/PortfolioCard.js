import React, { useState } from 'react';
import { portfolioAPI } from '../../services/api';

const PortfolioCard = ({ address, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getBlockchainInfo = (blockchain) => {
    const blockchainMap = {
      'bitcoin': { name: 'Bitcoin', symbol: 'BTC', gradient: 'from-orange-400 to-orange-600' },
      'ethereum': { name: 'Ethereum', symbol: 'ETH', gradient: 'from-blue-400 to-blue-600' },
      'dogecoin': { name: 'Dogecoin', symbol: 'DOGE', gradient: 'from-yellow-400 to-yellow-600' },
      'litecoin': { name: 'Litecoin', symbol: 'LTC', gradient: 'from-gray-400 to-gray-600' },
      'bitcoin-cash': { name: 'Bitcoin Cash', symbol: 'BCH', gradient: 'from-green-400 to-green-600' }
    };
    return blockchainMap[blockchain] || { name: blockchain, symbol: blockchain.toUpperCase(), gradient: 'from-gray-400 to-gray-600' };
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await portfolioAPI.deleteAddress(address.id);
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error('Delete error:', err);
      // You could add error handling here
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const formatBalance = (balance) => {
    if (typeof balance !== 'number') return '0';
    return balance.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 8 
    });
  };

  const formatValue = (value) => {
    const numValue = parseFloat(value) || 0;
    return numValue.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const blockchainInfo = getBlockchainInfo(address.blockchain);
  const hasError = !!address.error;

  return (
    <div className="clean-card p-6 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${blockchainInfo.gradient} flex items-center justify-center text-white font-bold text-sm mr-4 shadow-lg`}>
            {blockchainInfo.symbol.slice(0, 3)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{blockchainInfo.name}</h3>
            <p className="text-gray-600">{blockchainInfo.symbol}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
          title="Delete address"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Address */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-2 font-medium">Wallet Address</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-gray-900 font-mono text-sm">
            {formatAddress(address.address)}
          </p>
        </div>
      </div>

      {/* Balance and Value */}
      {hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm">{address.error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1 font-medium">Balance</p>
            <p className="text-xl font-bold text-gray-900">
              {formatBalance(address.balance)} {blockchainInfo.symbol}
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1 font-medium">Estimated Value</p>
            <p className="text-2xl font-bold gradient-text">
              ${formatValue(address.estimatedValueUSD)}
            </p>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {address.lastUpdated && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-xs">
            Last updated: {new Date(address.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Address</h3>
              <p className="text-gray-600">
                Are you sure you want to remove this {blockchainInfo.name} address from your portfolio?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 font-medium"
              >
                {deleting ? (
                  <div className="spinner mx-auto"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;
