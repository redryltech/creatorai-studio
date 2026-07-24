'use client';

export default function AnalyticsPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center h-14 px-6 border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm">
        <h1 className="text-sm font-semibold text-surface-100">Analytics</h1>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h2 className="text-lg font-semibold text-surface-100 mb-2">Coming Soon</h2>
          <p className="text-sm text-surface-400">Analytics Dashboard is under development.</p>
        </div>
      </div>
    </div>
  );
}
