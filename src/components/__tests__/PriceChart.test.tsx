import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import PriceChart from '@/components/PriceChart';

// Mock the API function
const mockFetchCoinPriceHistory = jest.fn() as jest.MockedFunction<typeof import('@/lib/api').fetchCoinPriceHistory>;
jest.mock('@/lib/api', () => ({
  fetchCoinPriceHistory: mockFetchCoinPriceHistory,
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
    mockFetchCoinPriceHistory.mockImplementation(() => new Promise(() => {}));

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
    expect(screen.getByText('Loading historical price data...')).toBeInTheDocument();
  });

  it('renders chart when data is successfully loaded', async () => {
    const mockData = {
      prices: [
        [1609459200000, 29000] as [number, number],
        [1609545600000, 31000] as [number, number],
        [1609632000000, 33000] as [number, number],
      ],
      market_caps: [] as [number, number][],
      total_volumes: [] as [number, number][],
    };

    mockFetchCoinPriceHistory.mockResolvedValue({ data: mockData, error: undefined });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    mockFetchCoinPriceHistory.mockResolvedValue({ 
      data: undefined as any, 
      error: 'Failed to fetch data' 
    });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByText('Chart temporarily unavailable')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('renders empty state when no price data is available', async () => {
    mockFetchCoinPriceHistory.mockResolvedValue({ 
      data: { 
        prices: [] as [number, number][], 
        market_caps: [] as [number, number][], 
        total_volumes: [] as [number, number][]
      }, 
      error: undefined 
    });

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    expect(screen.getByText('Chart data is not available for this time period.')).toBeInTheDocument();
  });

  it('uses fallback sparkline data when provided', async () => {
    const sparklineData = [29000, 31000, 33000];

    render(
      <PriceChart 
        coinId="bitcoin" 
        coinName="Bitcoin" 
        sparklineData={sparklineData} 
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    // Should not call the API when sparkline data is provided
    expect(mockFetchCoinPriceHistory).not.toHaveBeenCalled();
    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
  });
});