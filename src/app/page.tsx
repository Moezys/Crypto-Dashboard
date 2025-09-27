import { Suspense } from 'react';
import CoinList from '@/components/CoinList';
import WatchlistPanel from '@/components/WatchlistPanel';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { fetchCoinsList } from '@/lib/api';
import { DEFAULT_COINS } from '@/lib/types';

export default async function HomePage() {
  // Server-side data fetching
  const { data: initialCoins, error } = await fetchCoinsList(DEFAULT_COINS);

  if (error) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cryptocurrency Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track cryptocurrency prices, monitor your watchlist, and analyze market trends
            with hourly updates and interactive charts.
          </p>
        </div>

        {/* Error Section */}
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-lg mx-auto">
            <div className="mx-auto h-12 w-12 text-yellow-500 mb-4">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-12 w-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">
              {error.includes('Rate limit') ? 'API Rate Limit Reached' : 'Data Temporarily Unavailable'}
            </h2>
            <p className="text-yellow-700 text-sm mb-6">
              {error.includes('Rate limit') 
                ? 'The free CoinGecko API has usage limits. Cryptocurrency data will be available again shortly.'
                : error.includes('401') || error.includes('restricted')
                  ? 'API access is temporarily restricted. This usually resolves within a few minutes.'
                  : error}
            </p>
            <form action="" method="get">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
            </form>
            
            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">About Rate Limits</h3>
              <p className="text-xs text-blue-700">
                This dashboard uses the free CoinGecko API. Rate limits help ensure 
                fair usage and typically reset every few minutes. Premium APIs are 
                available for higher usage needs.
              </p>
            </div>
          </div>
        </div>

        {/* Watchlist Panel - Still functional */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-500">Coin list temporarily unavailable</p>
            </div>
          </div>
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
              <WatchlistPanel />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cryptocurrency Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track cryptocurrency prices, monitor your watchlist, and analyze market trends
          with hourly updates and interactive charts.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Coins Tracked
          </h3>
          <p className="text-3xl font-bold text-primary-500">
            {initialCoins?.length || 0}
          </p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Market Data
          </h3>
          <p className="text-sm text-gray-600">Updates hourly to respect API limits</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Data Source
          </h3>
          <p className="text-sm text-gray-600">CoinGecko API</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Coin List - Takes up 3 columns on large screens */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Market Overview
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Live cryptocurrency prices and market data
              </p>
            </div>
            <Suspense fallback={<LoadingSkeleton />}>
              <CoinList initialData={initialCoins || []} />
            </Suspense>
          </div>
        </div>

        {/* Watchlist Panel - Takes up 1 column on large screens */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="card">Loading watchlist...</div>}>
            <WatchlistPanel />
          </Suspense>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-gray-900">Live Prices</h3>
            <p className="text-sm text-gray-600">Hourly price updates</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="font-medium text-gray-900">Watchlist</h3>
            <p className="text-sm text-gray-600">Track favorite coins</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-gray-900">Price Charts</h3>
            <p className="text-sm text-gray-600">7-day price history</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-medium text-gray-900">Responsive</h3>
            <p className="text-sm text-gray-600">Works on all devices</p>
          </div>
        </div>
      </div>
    </div>
  );
}