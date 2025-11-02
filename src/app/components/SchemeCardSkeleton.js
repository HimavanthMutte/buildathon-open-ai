export default function SchemeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex flex-col h-full animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          {/* Category Badge Skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
        </div>
        {/* Save Button Skeleton */}
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg ml-2"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Details Grid Skeleton */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        </div>
      </div>

      {/* Benefits Skeleton */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      {/* Documents Skeleton */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* Apply Button Skeleton */}
      <div className="mt-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

