const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
)

const DashboardSkeleton = ({ cards = 4, rows = 5 }) => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-6">
        <Pulse className="h-8 w-64 mb-3" />
        <Pulse className="h-4 w-96" />
      </div>

      {/* Stat cards skeleton */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cards} gap-4 mb-6`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-8 w-16" />
              </div>
              <Pulse className="w-12 h-12 rounded-xl !rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        {[120, 100, 90].map((w, i) => (
          <Pulse key={i} className="h-10 rounded-xl" style={{ width: w }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Pulse className="h-5 w-48" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-50 flex items-center gap-4">
            <Pulse className="w-10 h-10 rounded-full !rounded-full" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-40" />
              <Pulse className="h-3 w-56" />
            </div>
            <Pulse className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardSkeleton
