import { CoinListItem, CoinDetail, PriceHistoryData, ApiResponse, DEFAULT_COINS } from './types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Generic fetch wrapper with error handling
async function fetchWithErrorHandling<T>(url: string, isServerSide = false): Promise<ApiResponse<T>> {
  try {
    const fetchOptions: RequestInit = {
      headers: {
        'Accept': 'application/json',
      },
    };

    // Only add Next.js specific options for server-side requests
    if (isServerSide && typeof window === 'undefined') {
      fetchOptions.next = { revalidate: 30 };
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. The free CoinGecko API has usage limits. Please try again in a few minutes.');
      }
      if (response.status === 401) {
        throw new Error('API access temporarily restricted. This may be due to rate limiting. Please try again later.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API fetch error:', error);
    return { 
      data: null as any, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Fetch list of cryptocurrencies with market data
export async function fetchCoinsList(coinIds?: string[]): Promise<ApiResponse<CoinListItem[]>> {
  const ids = coinIds?.join(',') || DEFAULT_COINS.join(',');
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=true&locale=en`;
  
  return fetchWithErrorHandling<CoinListItem[]>(url, true);
}

// Fetch detailed information for a specific coin
export async function fetchCoinDetail(coinId: string): Promise<ApiResponse<CoinDetail>> {
  const url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
  
  return fetchWithErrorHandling<CoinDetail>(url, true);
}

// Fetch sparkline data for a specific coin (as fallback for charts)
export async function fetchCoinSparkline(coinId: string): Promise<ApiResponse<CoinListItem>> {
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=true&locale=en`;
  
  const result = await fetchWithErrorHandling<CoinListItem[]>(url, false);
  
  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  } else {
    return { data: null as any, error: result.error || 'No sparkline data found' };
  }
}

// Fetch price history for a specific coin
export async function fetchCoinPriceHistory(
  coinId: string, 
  days: number = 7
): Promise<ApiResponse<PriceHistoryData>> {
  // Add a small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 7 ? 'hourly' : 'daily'}`;
  
  return fetchWithErrorHandling<PriceHistoryData>(url, false);
}

// Client-side polling function for live updates
export async function fetchCoinsListClient(coinIds?: string[]): Promise<CoinListItem[]> {
  const ids = coinIds?.join(',') || DEFAULT_COINS.join(',');
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=true&locale=en`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Client-side API fetch error:', error);
    throw error;
  }
}

// Format price with appropriate decimal places
export function formatPrice(price: number): string {
  if (price >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } else if (price >= 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(price);
  }
}

// Format market cap
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
}

// Format percentage change
export function formatPercentageChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

// Get color class for percentage change
export function getChangeColorClass(change: number): string {
  return change >= 0 ? 'text-green-500' : 'text-red-500';
}