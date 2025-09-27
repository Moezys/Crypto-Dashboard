import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import WatchlistPanel from '@/components/WatchlistPanel';

// Mock the watchlist utilities
const mockGetWatchlist = jest.fn();
const mockRemoveFromWatchlist = jest.fn();

jest.mock('@/lib/watchlist', () => ({
  getWatchlist: mockGetWatchlist,
  removeFromWatchlist: mockRemoveFromWatchlist,
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
    mockGetWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('0 coins tracked')).toBeInTheDocument();
    });
    
    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
    expect(screen.getByText('No coins in watchlist')).toBeInTheDocument();
    expect(screen.getByText('Add coins to your watchlist by clicking the star icon in the main table.')).toBeInTheDocument();
  });

  it('renders watchlist items when available', async () => {
    const mockWatchlist = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    ];

    mockGetWatchlist.mockReturnValue(mockWatchlist);

    render(<WatchlistPanel />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('2 coins tracked')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });

  it('removes item from watchlist when remove button is clicked', async () => {
    const mockWatchlist = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
    ];

    mockGetWatchlist.mockReturnValue(mockWatchlist);
    mockRemoveFromWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    // Wait for loading to complete and item to appear
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    
    const removeButton = screen.getByLabelText('Remove Bitcoin from watchlist');
    fireEvent.click(removeButton);

    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('bitcoin');
  });

  it('clears all items when clear all button is clicked', async () => {
    const mockWatchlist = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    ];

    mockGetWatchlist.mockReturnValue(mockWatchlist);
    mockRemoveFromWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    // Wait for loading to complete and items to appear
    await waitFor(() => {
      expect(screen.getByText('2 coins tracked')).toBeInTheDocument();
    });
    
    const clearAllButton = screen.getByText('Clear all');
    fireEvent.click(clearAllButton);

    expect(mockRemoveFromWatchlist).toHaveBeenCalledTimes(2);
    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('bitcoin');
    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('ethereum');
  });
});