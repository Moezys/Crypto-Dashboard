import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import PriceChart from '@/components/PriceChart';

// Mock the API function
jest.mock('@/lib/api', () => ({
  fetchCoinPriceHistory: jest.fn(),
}));

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('PriceChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const { fetchCoinPriceHistory } = require('@/lib/api');
    fetchCoinPriceHistory.mockImplementation(() => new Promise(() => {}));

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
    expect(screen.getByText('Loading historical price data...')).toBeInTheDocument();
  });

  it('renders chart when data is successfully loaded', async () => {
    const mockData = {
      prices: [
        [1609459200000, 29000],
        [1609545600000, 31000],
        [1609632000000, 33000],
      ],
    };

    const { fetchCoinPriceHistory } = require('@/lib/api');
    fetchCoinPriceHistory.mockResolvedValue({ data: mockData, error: null });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    const { fetchCoinPriceHistory } = require('@/lib/api');
    fetchCoinPriceHistory.mockResolvedValue({ 
      data: null, 
      error: 'Failed to fetch data' 
    });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByText('Chart unavailable')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('renders empty state when no price data is available', async () => {
    const { fetchCoinPriceHistory } = require('@/lib/api');
    fetchCoinPriceHistory.mockResolvedValue({ 
      data: { prices: [] }, 
      error: null 
    });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    expect(screen.getByText('Chart data is not available for this time period.')).toBeInTheDocument();
  });

  it('calculates price change correctly', async () => {
    const mockData = {
      prices: [
        [1609459200000, 30000],
        [1609545600000, 31000],
        [1609632000000, 32000],
      ],
    };

    const { fetchCoinPriceHistory } = require('@/lib/api');
    fetchCoinPriceHistory.mockResolvedValue({ data: mockData, error: null });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByText(/Change:/)).toBeInTheDocument();
    });

    // Should show positive change from 30000 to 32000
    expect(screen.getByText(/\+\$2,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/\+6.67%/)).toBeInTheDocument();
  });
});