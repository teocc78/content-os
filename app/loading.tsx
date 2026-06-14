export default function Loading() {
  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        <div className="h-10 bg-gray-800 rounded mb-8 w-64" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
              <div className="h-4 bg-gray-800 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-32" />
            </div>
          ))}
        </div>

        {/* Retention Breakdown */}
        <div className="p-6 rounded border mb-8" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
          <div className="h-6 bg-gray-800 rounded w-32 mb-4" />
          <div className="flex flex-wrap gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-800 rounded w-24" />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
          <div className="h-6 bg-gray-800 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
