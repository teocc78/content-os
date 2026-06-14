export default function Loading() {
  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div className="h-8 bg-gray-800 rounded w-32" />
          <div className="h-10 bg-gray-800 rounded w-24" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
                <div className="h-4 bg-gray-800 rounded w-20 mb-3" />
                <div className="h-12 bg-gray-800 rounded" />
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
                <div className="h-6 bg-gray-800 rounded w-32 mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-800 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
