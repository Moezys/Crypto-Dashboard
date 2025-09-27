import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import WatchlistPanel from '@/components/WatchlistPanel';

// Mock the watchlist utilities
jest.mock('@/lib/watchlist', () => ({
  getWatchlist: jest.fn(),
  removeFromWatchlist: jest.fn(),
}));

// Mock Next.js components
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('WatchlistPanel', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders empty state when watchlist is empty', async () => {
    const { getWatchlist } = require('@/lib/watchlist');
    getWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
    expect(screen.getByText('No coins in watchlist')).toBeInTheDocument();
    expect(screen.getByText('Add coins to your watchlist by clicking the star icon in the main table.')).toBeInTheDocument();
  });

  it('renders watchlist items when available', async () => {
    const mockWatchlist = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    ];

    const { getWatchlist } = require('@/lib/watchlist');
    getWatchlist.mockReturnValue(mockWatchlist);

    render(<WatchlistPanel />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('2 coins tracked')).toBeInTheDocument();
  });

  it('removes item from watchlist when remove button is clicked', async () => {
    const mockWatchlist = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
    ];

    const { getWatchlist, removeFromWatchlist } = require('@/lib/watchlist');
    getWatchlist.mockReturnValue(mockWatchlist);
    removeFromWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    const removeButton = screen.getByLabelText('Remove Bitcoin from watchlist');
    fireEvent.click(removeButton);

    expect(removeFromWatchlist).toHaveBeenCalledWith('bitcoin');
  });

  it('clears all items when clear all button is clicked', async () => {
    const mockWatchlist = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    ];

    const { getWatchlist, removeFromWatchlist } = require('@/lib/watchlist');
    getWatchlist.mockReturnValue(mockWatchlist);
    removeFromWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    const clearAllButton = screen.getByText('Clear all');
    fireEvent.click(clearAllButton);

    expect(removeFromWatchlist).toHaveBeenCalledTimes(2);
    expect(removeFromWatchlist).toHaveBeenCalledWith('bitcoin');
    expect(removeFromWatchlist).toHaveBeenCalledWith('ethereum');
  });
});