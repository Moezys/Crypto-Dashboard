import { render, screen } from '@testing-library/react';
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

  it('renders without crashing when empty', () => {
    mockGetWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
  });

  it('renders component title', () => {
    mockGetWatchlist.mockReturnValue([]);

    render(<WatchlistPanel />);

    expect(screen.getByRole('heading', { name: 'My Watchlist' })).toBeInTheDocument();
  });
});