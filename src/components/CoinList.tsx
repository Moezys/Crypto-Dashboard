'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinListItem } from '@/lib/types';
import { 
  fetchCoinsListClient, 
  formatPrice, 
  formatMarketCap, 
  formatPercentageChange, 
  getChangeColorClass 
} from '@/lib/api';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist';

// Hydration-safe timestamp component
function HydrationSafeTimestamp({ timestamp }: { timestamp: Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>Loading time...</span>;
  }

  return <span>{timestamp.toLocaleTimeString()}</span>;
}

interface CoinListProps {
  initialData: CoinListItem[];
}

export default function CoinList({ initialData }: CoinListProps) {
  const [coins, setCoins] = useState<CoinListItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Initialize watchlist on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/watchlist').then(({ getWatchlistIds }) => {
        setWatchlist(getWatchlistIds());
      });
    }
  }, []);

  // Polling for live updates every hour to avoid API rate limits
  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true);
      try {
        const coinIds = coins.map(coin => coin.id);
        const updatedCoins = await fetchCoinsListClient(coinIds);
        setCoins(updatedCoins);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to update coin data:', error);
      } finally {
        setLoading(false);
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [coins]);

  const handleWatchlistToggle = async (coin: CoinListItem, isAdding: boolean) => {
    const watchlistItem = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name
    };

    try {
      if (isAdding) {
        const updated = addToWatchlist(watchlistItem);
        setWatchlist(updated.map(item => item.id));
      } else {
        const updated = removeFromWatchlist(coin.id);
        setWatchlist(updated.map(item => item.id));
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  const isInWatchlistLocal = (coinId: string) => {
    return watchlist.includes(coinId);
  };

  return (
    <div className="relative">
      {/* Loading Indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-10"
          >
            <div className="flex items-center space-x-2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              <span>Updating...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Updated */}
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
        Last updated: <HydrationSafeTimestamp timestamp={lastUpdated} />
      </div>

      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:block px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Name</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h Change</div>
          <div className="col-span-3 text-right">Market Cap</div>
          <div className="col-span-1 text-center">Watch</div>
        </div>
      </div>

      {/* Coin Rows - Responsive Design */}
      <div className="divide-y divide-gray-100">
        {coins.map((coin, index) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              <div className="flex items-start justify-between mb-3">
                <Link
                  href={`/coin/${coin.id}`}
                  className="flex items-center space-x-3 hover:text-primary-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1 -m-1 min-w-0 flex-1"
                >
                  <div className="relative h-8 w-8 flex-shrink-0">
                    <Image
                      src={coin.image}
                      alt={`${coin.name} logo`}
                      fill
                      className="rounded-full object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{coin.name}</div>
                    <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                  </div>
                </Link>
                <button
                  onClick={() => handleWatchlistToggle(coin, !isInWatchlistLocal(coin.id))}
                  className={`p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0 ml-2 ${
                    isInWatchlistLocal(coin.id)
                      ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                  }`}
                  aria-label={`${isInWatchlistLocal(coin.id) ? 'Remove from' : 'Add to'} watchlist`}
                >
                  <svg
                    className="h-4 w-4"
                    fill={isInWatchlistLocal(coin.id) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(coin.current_price)}
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getChangeColorClass(coin.price_change_percentage_24h)} ${
                    coin.price_change_percentage_24h >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {formatPercentageChange(coin.price_change_percentage_24h)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Market Cap:</span>
                    <span className="font-medium text-gray-900">{formatMarketCap(coin.market_cap)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Coin Info */}
                <div className="col-span-4">
                  <Link
                    href={`/coin/${coin.id}`}
                    className="flex items-center space-x-3 hover:text-primary-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1 -m-1"
                  >
                    <div className="relative h-8 w-8">
                      <Image
                        src={coin.image}
                        alt={`${coin.name} logo`}
                        fill
                        className="rounded-full object-cover"
                        sizes="32px"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{coin.name}</div>
                      <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                    </div>
                  </Link>
                </div>

                {/* Price */}
                <div className="col-span-2 text-right">
                  <div className="font-medium text-gray-900">
                    {formatPrice(coin.current_price)}
                  </div>
                </div>

                {/* 24h Change */}
                <div className="col-span-2 text-right">
                  <div className={`font-medium ${getChangeColorClass(coin.price_change_percentage_24h)}`}>
                    {formatPercentageChange(coin.price_change_percentage_24h)}
                  </div>
                </div>

                {/* Market Cap */}
                <div className="col-span-3 text-right">
                  <div className="font-medium text-gray-900">
                    {formatMarketCap(coin.market_cap)}
                  </div>
                </div>

                {/* Watchlist Button */}
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => handleWatchlistToggle(coin, !isInWatchlistLocal(coin.id))}
                    className={`p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isInWatchlistLocal(coin.id)
                        ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                    }`}
                    aria-label={`${isInWatchlistLocal(coin.id) ? 'Remove from' : 'Add to'} watchlist`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill={isInWatchlistLocal(coin.id) ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {coins.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">No coins to display</h3>
            <p className="text-sm">Try refreshing the page or check your connection.</p>
          </div>
        </div>
      )}
    </div>
  );
}