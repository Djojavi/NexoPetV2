function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-surface px-12 py-14 shadow-[var(--shadow-card)]">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-3xl shadow-[var(--shadow-lifted)]"
          aria-hidden="true"
        >
          🐾
        </span>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-primary-700">
            NexoPet
          </h1>
          <p className="text-neutral-500">
            Clínica veterinaria · historial clínico de mascotas
          </p>
        </div>
      </div>
    </main>
  )
}

export default App
