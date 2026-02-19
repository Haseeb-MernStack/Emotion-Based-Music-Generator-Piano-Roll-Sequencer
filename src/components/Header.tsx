export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-md mb-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">MuseForge</h1>
          <p className="text-sm opacity-90">Fast melodic ideas, polished exports — create music in minutes.</p>
        </div>
        <div className="hidden sm:flex items-center space-x-3">
          <a className="px-3 py-1 bg-white/10 rounded">Demo</a>
          <a className="px-3 py-1 bg-white/10 rounded">Docs</a>
          <a className="px-3 py-1 bg-white rounded text-purple-600 font-semibold">Submit</a>
        </div>
      </div>
    </header>
  );
}
