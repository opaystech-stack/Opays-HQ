export default function DashboardLoading() {
  return (
    <div className="min-h-full bg-[#f8f9fb] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-32 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
