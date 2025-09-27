import { WatchlistItem } from './types';

const WATCHLIST_KEY = 'crypto-watchlist';

// Check if we're running in the browser
const isBrowser = typeof window !== 'undefined';

// Get watchlist from localStorage
export function getWatchlist(): WatchlistItem[] {
  if (!isBrowser) return [];
  
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading watchlist from localStorage:', error);
    return [];
  }
}

// Save watchlist to localStorage
export function saveWatchlist(watchlist: WatchlistItem[]): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error saving watchlist to localStorage:', error);
  }
}

// Add coin to watchlist
export function addToWatchlist(coin: WatchlistItem): WatchlistItem[] {
  const current = getWatchlist();
  const exists = current.some(item => item.id === coin.id);
  
  if (!exists) {
    const updated = [...current, coin];
    saveWatchlist(updated);
    return updated;
  }
  
  return current;
}

// Remove coin from watchlist
export function removeFromWatchlist(coinId: string): WatchlistItem[] {
  const current = getWatchlist();
  const updated = current.filter(item => item.id !== coinId);
  saveWatchlist(updated);
  return updated;
}

// Check if coin is in watchlist
export function isInWatchlist(coinId: string): boolean {
  const watchlist = getWatchlist();
  return watchlist.some(item => item.id === coinId);
}

// Get coin IDs from watchlist
export function getWatchlistIds(): string[] {
  return getWatchlist().map(item => item.id);
}