export default function Loading() {
  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 bg-gray-800 rounded w-48" />
          <div className="h-10 bg-gray-800 rounded w-32" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-6 rounded border mb-6" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-gray-800 rounded w-20 mb-2" />
              <div className="h-10 bg-gray-800 rounded" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
          <div className="h-12 bg-gray-800 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
