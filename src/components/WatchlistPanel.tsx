'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { WatchlistItem } from '@/lib/types';
import { getWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { WatchlistSkeleton } from './LoadingSkeleton';

export default function WatchlistPanel() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load watchlist from localStorage on mount
    const loadWatchlist = () => {
      const stored = getWatchlist();
      setWatchlist(stored);
      setLoading(false);
    };

    loadWatchlist();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'crypto-watchlist') {
        loadWatchlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRemove = (coinId: string) => {
    const updated = removeFromWatchlist(coinId);
    setWatchlist(updated);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Watchlist</h2>
        <WatchlistSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My Watchlist</h2>
        <p className="text-sm text-gray-600 mt-1">
          {watchlist.length} coin{watchlist.length !== 1 ? 's' : ''} tracked
        </p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {watchlist.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No coins in watchlist
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add coins to your watchlist by clicking the star icon in the main table.
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Browse coins
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <AnimatePresence>
                {watchlist.map((coin, index) => (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Link
                      href={`/coin/${coin.id}`}
                      className="flex items-center space-x-3 flex-1 hover:text-primary-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1 -m-1"
                    >
                      <div className="text-2xl">
                        {/* We'll use emoji as fallback since we don't have image data in watchlist */}
                        {coin.symbol === 'btc' ? '₿' : 
                         coin.symbol === 'eth' ? 'Ξ' : 
                         coin.symbol === 'ltc' ? 'Ł' : 
                         coin.symbol === 'ada' ? '₳' : 
                         coin.symbol === 'sol' ? '◎' : '🪙'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {coin.name}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {coin.symbol}
                        </div>
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => handleRemove(coin.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Remove ${coin.name} from watchlist`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {watchlist.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quick actions</span>
              <button
                onClick={() => {
                  watchlist.forEach(coin => handleRemove(coin.id));
                }}
                className="text-xs text-red-500 hover:text-red-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}