export default function LawyersLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="h-8 w-56 bg-surface-dim rounded animate-pulse mb-2" />
        <div className="h-4 w-80 bg-surface-dim rounded animate-pulse" />
      </div>
      <div className="flex gap-3 mb-8 p-4 bg-surface-dim rounded-lg">
        <div className="h-10 w-32 bg-surface rounded animate-pulse" />
        <div className="h-10 w-40 bg-surface rounded animate-pulse" />
        <div className="h-10 w-32 bg-surface rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="h-12 w-12 bg-surface-dim rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-surface-dim rounded animate-pulse" />
            </div>
            <div className="h-5 w-2/3 bg-surface-dim rounded animate-pulse mb-2" />
            <div className="h-3 w-1/3 bg-surface-dim rounded animate-pulse mb-3" />
            <div className="flex gap-1 mb-3">
              <div className="h-5 w-16 bg-surface-dim rounded animate-pulse" />
              <div className="h-5 w-20 bg-surface-dim rounded animate-pulse" />
            </div>
            <div className="h-3 w-1/2 bg-surface-dim rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
