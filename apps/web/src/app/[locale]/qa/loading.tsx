export default function QaLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-surface-dim rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-surface-dim rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-surface-dim rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-surface-dim rounded animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-center">
                <div className="h-6 w-8 bg-surface-dim rounded animate-pulse mx-auto mb-1" />
                <div className="h-2 w-10 bg-surface-dim rounded animate-pulse mx-auto" />
              </div>
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-surface-dim rounded animate-pulse mb-2" />
                <div className="h-3 w-full bg-surface-dim rounded animate-pulse mb-1" />
                <div className="h-3 w-2/3 bg-surface-dim rounded animate-pulse mb-3" />
                <div className="flex gap-3">
                  <div className="h-3 w-16 bg-surface-dim rounded animate-pulse" />
                  <div className="h-3 w-12 bg-surface-dim rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
