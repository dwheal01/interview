function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="max-w-xl px-6 py-8 rounded-2xl shadow-2xl bg-slate-900/70 ring-1 ring-slate-700/60 backdrop-blur">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Aristotilean
          <span className="text-sky-400">Chat</span>
        </h1>
        <p className="mt-3 text-slate-300 text-sm md:text-base">
          A fresh React + Vite + TypeScript app styled with{' '}
          <span className="font-semibold text-sky-300">TailwindCSS</span>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition">
            Get Started
          </button>
          <button className="inline-flex items-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800/80 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
