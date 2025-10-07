export function Welcome({ name }: { name: string }) {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <h1>Welcome, {name}</h1>
          <p>Tools:</p>
          <ul>
            <li>Vitest</li>
            <li>MSW</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
