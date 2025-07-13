import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portfolioAPI } from '../../services/api';
import AddressForm from './AddressForm';
import PortfolioCard from './PortfolioCard';
import TradingViewWidget from './TradingViewWidget';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { user, logout } = useAuth();

  const fetchPortfolio = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const response = await portfolioAPI.getPortfolio();
      const { portfolio: portfolioData, totalPortfolioValueUSD } = response.data;

      setPortfolio(portfolioData);
      setTotalValue(parseFloat(totalPortfolioValueUSD) || 0);
      setError('');
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddressAdded = () => {
    fetchPortfolio(true);
  };

  const handleAddressDeleted = () => {
    fetchPortfolio(true);
  };

  const handleRefresh = () => {
    fetchPortfolio(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="clean-card p-8 text-center">
          <div className="spinner mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Portfolio...</h3>
          <p className="text-gray-600">Fetching your crypto data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Crypto <span className="gradient-text">Portfolio</span>
              </h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold gradient-text-purple">{user?.username || 'User'}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
              >
                <div className="flex items-center">
                  <svg className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin-reverse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </div>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="mb-8">
          <div className="clean-card p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Total Portfolio Value
              </h2>
              <p className="text-5xl font-bold gradient-text mb-2">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-600">
                Across {portfolio.length} address{portfolio.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* TradingView Widget */}
        <div className="mb-8">
          <div className="clean-card p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Market Overview
              </h2>
              <p className="text-gray-600 text-center">
                Live cryptocurrency prices and charts
              </p>
            </div>
            <div className="h-96 rounded-xl overflow-hidden">
              <TradingViewWidget />
            </div>
          </div>
        </div>

        {/* Add Address Form */}
        <div className="mb-8">
          <AddressForm onAddressAdded={handleAddressAdded} />
        </div>

        {/* Portfolio List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Your Addresses</h3>

          {portfolio.length === 0 ? (
            <div className="clean-card p-12 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 mb-4">
                  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No addresses added yet</h3>
                <p className="text-gray-600 text-lg">
                  Add your first cryptocurrency address above to start tracking your portfolio.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((address, index) => (
                <PortfolioCard
                  key={address.id}
                  address={address}
                  onDelete={handleAddressDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
