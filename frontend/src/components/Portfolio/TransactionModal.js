import React, { useState, useEffect } from 'react';
import { portfolioAPI } from '../../services/api';

const TransactionModal = ({ isOpen, onClose, address, blockchain, addressId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && addressId) {
      fetchTransactions();
    }
  }, [isOpen, addressId]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await portfolioAPI.getTransactions(addressId);
      console.log('Frontend received transactions:', response.data);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr || addr === 'N/A') return 'N/A';
    const addrStr = String(addr);
    if (addrStr.length <= 16) return addrStr;
    return `${addrStr.slice(0, 8)}...${addrStr.slice(-8)}`;
  };

  const formatAmount = (amount, type) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0';
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    });
    return type === 'send' ? `-${formatted}` : `+${formatted}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getBlockchainSymbol = (blockchain) => {
    const symbols = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'dogecoin': 'DOGE',
      'litecoin': 'LTC',
      'bitcoin-cash': 'BCH'
    };
    return symbols[blockchain] || blockchain.toUpperCase();
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'send':
        return 'text-red-600 bg-red-50';
      case 'receive':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'send':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case 'receive':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              <p className="text-gray-600 mt-1">
                {getBlockchainSymbol(blockchain)} Address: {formatAddress(address)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Transactions</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchTransactions}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-600">This address has no transaction history available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions ({transactions.length})
                </h3>
                <button
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <svg className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </div>
                </button>
              </div>

              {transactions.map((tx, index) => (
                <div key={tx.txId || index} className="clean-card p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTransactionTypeColor(tx.type)}`}>
                        {getTransactionTypeIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(tx.type)}`}>
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(tx.date)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 font-mono">
                            TX: {formatAddress(tx.txId || 'N/A')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                        {formatAmount(tx.amount, tx.type)} {getBlockchainSymbol(blockchain)}
                      </p>
                      {tx.blockHeight && tx.blockHeight > 0 && (
                        <p className="text-sm text-gray-500">
                          Block #{tx.blockHeight.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TransactionModal;
