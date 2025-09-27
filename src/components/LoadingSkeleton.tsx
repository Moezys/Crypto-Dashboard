export default function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {/* Table Header Skeleton */}
      <div className="grid grid-cols-5 gap-4 pb-4 border-b border-gray-200">
        <div className="skeleton h-4 w-16"></div>
        <div className="skeleton h-4 w-20"></div>
        <div className="skeleton h-4 w-16"></div>
        <div className="skeleton h-4 w-20"></div>
        <div className="skeleton h-4 w-16"></div>
      </div>
      
      {/* Table Rows Skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="skeleton h-8 w-8 rounded-full"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-3 w-16"></div>
            </div>
          </div>
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-16"></div>
          <div className="skeleton h-4 w-20"></div>
          <div className="skeleton h-8 w-8 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="skeleton h-6 w-32 mx-auto mb-2"></div>
        <div className="skeleton h-4 w-24 mx-auto"></div>
      </div>
    </div>
  );
}

export function WatchlistSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="skeleton h-6 w-6 rounded-full"></div>
            <div className="space-y-1">
              <div className="skeleton h-3 w-16"></div>
              <div className="skeleton h-2 w-12"></div>
            </div>
          </div>
          <div className="skeleton h-6 w-6 rounded"></div>
        </div>
      ))}
    </div>
  );
}