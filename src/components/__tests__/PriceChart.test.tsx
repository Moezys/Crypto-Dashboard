import { render, screen } from '@testing-library/react';
import { act } from 'react';
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

  it('renders without crashing', () => {
    mockFetchCoinPriceHistory.mockImplementation(() => new Promise(() => {}));

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockFetchCoinPriceHistory.mockImplementation(() => new Promise(() => {}));

    render(<PriceChart coinId="bitcoin" coinName="Bitcoin" />);

    expect(screen.getByText('Loading historical price data...')).toBeInTheDocument();
  });

  it('renders with sparkline data without API call', () => {
    const sparklineData = [29000, 31000, 33000];

    render(
      <PriceChart 
        coinId="bitcoin" 
        coinName="Bitcoin" 
        sparklineData={sparklineData} 
      />
    );

    expect(screen.getByText('Bitcoin Price Chart (7d)')).toBeInTheDocument();
    // Should not call the API when sparkline data is provided
    expect(mockFetchCoinPriceHistory).not.toHaveBeenCalled();
  });
});