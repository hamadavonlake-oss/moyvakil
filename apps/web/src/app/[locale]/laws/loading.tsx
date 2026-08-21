export default function LawsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="h-8 w-48 bg-surface-dim rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-surface-dim rounded animate-pulse" />
      </div>
      <div className="flex gap-3 mb-8">
        <div className="h-10 flex-1 bg-surface-dim rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-surface-dim rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 w-5 bg-surface-dim rounded animate-pulse" />
              <div className="h-5 w-16 bg-surface-dim rounded animate-pulse" />
            </div>
            <div className="h-5 w-3/4 bg-surface-dim rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-surface-dim rounded animate-pulse mb-2" />
            <div className="h-3 w-1/3 bg-surface-dim rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
