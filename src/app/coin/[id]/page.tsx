import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { fetchCoinDetail, fetchCoinSparkline } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentageChange, getChangeColorClass } from '@/lib/api';
import { ChartSkeleton } from '@/components/LoadingSkeleton';

// Lazy load the PriceChart component
const PriceChart = dynamic(() => import('@/components/PriceChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

interface CoinPageProps {
  params: {
    id: string;
  };
}

export default async function CoinPage({ params }: CoinPageProps) {
  const { data: coin, error } = await fetchCoinDetail(params.id);
  // Try to get sparkline data for charts (this endpoint works better)
  const { data: coinSparkline } = await fetchCoinSparkline(params.id);

  // Handle rate limiting or API errors gracefully
  if (error || !coin) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Error State */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 text-yellow-500 mb-4">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-16 w-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Coin Details Temporarily Unavailable
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error?.includes('Rate limit') 
                ? 'The CoinGecko API rate limit has been reached. Detailed coin information will be available again shortly.'
                : error?.includes('401') || error?.includes('restricted')
                  ? 'API access is temporarily restricted. This usually resolves within a few minutes.'
                  : 'Unable to load coin details. This may be due to network issues or API limitations.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <form action="" method="get">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
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
              </form>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h2a2 2 0 012 2v1H8V5z"
                  />
                </svg>
                View Dashboard
              </Link>
            </div>
            
            {/* Rate Limit Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-lg mx-auto">
              <h3 className="text-sm font-medium text-blue-800 mb-2">About API Rate Limits</h3>
              <p className="text-xs text-blue-700">
                This app uses the free CoinGecko API which has usage limits. 
                Rate limits typically reset every few minutes. The main dashboard 
                may still work for basic coin listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = coin.market_data.current_price.usd;
  const priceChange24h = coin.market_data.price_change_percentage_24h;
  const marketCap = coin.market_data.market_cap.usd;
  const volume24h = coin.market_data.total_volume.usd;
  const circulatingSupply = coin.market_data.circulating_supply;
  const totalSupply = coin.market_data.total_supply;
  const maxSupply = coin.market_data.max_supply;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Coin Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16">
              <Image
                src={coin.image.large}
                alt={`${coin.name} logo`}
                fill
                className="rounded-full object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{coin.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-500 uppercase">{coin.symbol}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  Rank #{coin.market_cap_rank}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Current Price</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">24h Change</h3>
            <p className={`text-xl font-semibold ${getChangeColorClass(priceChange24h)}`}>
              {formatPercentageChange(priceChange24h)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Market Cap</h3>
            <p className="text-xl font-semibold text-gray-900">
              {formatMarketCap(marketCap)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">24h Volume</h3>
            <p className="text-xl font-semibold text-gray-900">
              {formatMarketCap(volume24h)}
            </p>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Suspense fallback={<ChartSkeleton />}>
          <PriceChart 
            coinId={params.id} 
            coinName={coin.name} 
            days={7}
            sparklineData={coinSparkline?.sparkline_in_7d?.price}
          />
        </Suspense>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Market Cap Rank</span>
              <span className="font-medium">#{coin.market_cap_rank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Circulating Supply</span>
              <span className="font-medium">
                {circulatingSupply.toLocaleString()} {coin.symbol.toUpperCase()}
              </span>
            </div>
            {totalSupply && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total Supply</span>
                <span className="font-medium">
                  {totalSupply.toLocaleString()} {coin.symbol.toUpperCase()}
                </span>
              </div>
            )}
            {maxSupply && (
              <div className="flex justify-between">
                <span className="text-gray-600">Max Supply</span>
                <span className="font-medium">
                  {maxSupply.toLocaleString()} {coin.symbol.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">All-Time High</span>
              <div className="text-right">
                <div className="font-medium">{formatPrice(coin.market_data.ath.usd)}</div>
                <div className={`text-sm ${getChangeColorClass(coin.market_data.ath_change_percentage.usd)}`}>
                  {formatPercentageChange(coin.market_data.ath_change_percentage.usd)}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">All-Time Low</span>
              <div className="text-right">
                <div className="font-medium">{formatPrice(coin.market_data.atl.usd)}</div>
                <div className={`text-sm ${getChangeColorClass(coin.market_data.atl_change_percentage.usd)}`}>
                  {formatPercentageChange(coin.market_data.atl_change_percentage.usd)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Performance</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">1 Hour</span>
              <span className={`font-medium ${
                coin.market_data.price_change_percentage_1h_in_currency?.usd 
                  ? getChangeColorClass(coin.market_data.price_change_percentage_1h_in_currency.usd)
                  : 'text-gray-400'
              }`}>
                {coin.market_data.price_change_percentage_1h_in_currency?.usd 
                  ? formatPercentageChange(coin.market_data.price_change_percentage_1h_in_currency.usd)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">24 Hours</span>
              <span className={`font-medium ${getChangeColorClass(priceChange24h)}`}>
                {formatPercentageChange(priceChange24h)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">7 Days</span>
              <span className={`font-medium ${
                coin.market_data.price_change_percentage_7d_in_currency?.usd 
                  ? getChangeColorClass(coin.market_data.price_change_percentage_7d_in_currency.usd)
                  : 'text-gray-400'
              }`}>
                {coin.market_data.price_change_percentage_7d_in_currency?.usd 
                  ? formatPercentageChange(coin.market_data.price_change_percentage_7d_in_currency.usd)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">30 Days</span>
              <span className={`font-medium ${
                coin.market_data.price_change_percentage_30d_in_currency?.usd 
                  ? getChangeColorClass(coin.market_data.price_change_percentage_30d_in_currency.usd)
                  : 'text-gray-400'
              }`}>
                {coin.market_data.price_change_percentage_30d_in_currency?.usd 
                  ? formatPercentageChange(coin.market_data.price_change_percentage_30d_in_currency.usd)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">1 Year</span>
              <span className={`font-medium ${
                coin.market_data.price_change_percentage_1y_in_currency?.usd 
                  ? getChangeColorClass(coin.market_data.price_change_percentage_1y_in_currency.usd)
                  : 'text-gray-400'
              }`}>
                {coin.market_data.price_change_percentage_1y_in_currency?.usd 
                  ? formatPercentageChange(coin.market_data.price_change_percentage_1y_in_currency.usd)
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {coin.description.en && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About {coin.name}</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: coin.description.en.split('. ').slice(0, 3).join('. ') + '.' 
            }}
          />
        </div>
      )}
    </div>
  );
}