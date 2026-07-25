export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Deplyx</h1>
      <p className="max-w-md text-gray-600">
        Scaffold booted — Phase 01 (monorepo + tooling) is running. Dashboard, auth, and scanning
        land in later phases per <code className="rounded bg-gray-100 px-1">docs/plans/</code>.
      </p>
    </main>
  );
}
