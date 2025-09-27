import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crypto Price Dashboard',
  description: 'Cryptocurrency price tracking and portfolio management with hourly updates',
  keywords: 'cryptocurrency, bitcoin, ethereum, crypto prices, portfolio tracker',
  authors: [{ name: 'Your Name' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    🚀 Crypto Dashboard
                  </h1>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a
                    href="/"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#watchlist"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Watchlist
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-500 text-sm">
                <p>
                  © 2024 Crypto Dashboard. Data provided by{' '}
                  <a
                    href="https://www.coingecko.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 underline focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    CoinGecko
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}