'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchCoinPriceHistory } from '@/lib/api';
import { PriceHistoryData, ChartDataPoint } from '@/lib/types';
import { ChartSkeleton } from './LoadingSkeleton';

interface PriceChartProps {
  coinId: string;
  coinName: string;
  days?: number;
  sparklineData?: number[]; // Fallback data from main API
}

export default function PriceChart({ coinId, coinName, days = 7, sparklineData }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to use sparkline data if available
        if (sparklineData && sparklineData.length > 0) {
          const fallbackData: ChartDataPoint[] = sparklineData.map((price, index) => ({
            timestamp: Date.now() - (sparklineData.length - index) * 3600000, // Hourly intervals
            price,
            date: new Date(Date.now() - (sparklineData.length - index) * 3600000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: days <= 1 ? 'numeric' : undefined,
            }),
          }));
          setChartData(fallbackData);
          setLoading(false);
          return;
        }

        // Only fetch from API if no sparkline data is available
        const { data, error: apiError } = await fetchCoinPriceHistory(coinId, days);
        
        if (apiError) {
          setError(apiError);
          return;
        }

        if (data?.prices) {
          const formattedData: ChartDataPoint[] = data.prices.map(([timestamp, price]) => ({
            timestamp,
            price,
            date: new Date(timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: days <= 1 ? 'numeric' : undefined,
            }),
          }));
          
          setChartData(formattedData);
        }
      } catch (err) {
        // Final fallback to sparkline data
        if (sparklineData && sparklineData.length > 0) {
          const fallbackData: ChartDataPoint[] = sparklineData.map((price, index) => ({
            timestamp: Date.now() - (sparklineData.length - index) * 3600000,
            price,
            date: new Date(Date.now() - (sparklineData.length - index) * 3600000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
          }));
          setChartData(fallbackData);
        } else {
          setError('Failed to load chart data');
        }
        console.error('Chart data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId, days, sparklineData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const price = payload[0].value;
      const date = new Date(data.timestamp);
      
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">
            ${typeof price === 'number' ? price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            }) : price}
          </p>
          <p className="text-xs text-gray-600">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {coinName} Price Chart ({days}d)
          </h3>
          <p className="text-sm text-gray-600">Loading historical price data...</p>
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {coinName} Price Chart ({days}d)
          </h3>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 mb-2">
            <svg
              className="mx-auto h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-yellow-800 mb-2">Chart temporarily unavailable</h4>
          <p className="text-sm text-yellow-700 mb-4">
            {error.includes('Rate limit') 
              ? 'API rate limit reached. Charts will be available again shortly.' 
              : error.includes('401') 
                ? 'API access temporarily restricted. Please try again in a few minutes.'
                : error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
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
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {coinName} Price Chart ({days}d)
          </h3>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-800 mb-1">No data available</h4>
          <p className="text-sm text-gray-600">Chart data is not available for this time period.</p>
        </div>
      </div>
    );
  }

  // Calculate price change
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {coinName} Price Chart ({days}d)
        </h3>
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-gray-600">Current: </span>
            <span className="font-medium text-gray-900">
              ${lastPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Change: </span>
            <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}${priceChange.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `$${value.toLocaleString('en-US', {
                notation: 'compact',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                stroke: isPositive ? '#10b981' : '#ef4444',
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Data updates hourly • Source: CoinGecko
      </div>
    </div>
  );
}