export default function GuidesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="h-8 w-52 bg-surface-dim rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-surface-dim rounded animate-pulse" />
      </div>
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-surface-dim rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-6">
            <div className="h-8 w-8 bg-surface-dim rounded animate-pulse mb-3" />
            <div className="h-5 w-3/4 bg-surface-dim rounded animate-pulse mb-2" />
            <div className="h-3 w-1/3 bg-surface-dim rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
