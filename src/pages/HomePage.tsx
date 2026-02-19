import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">
        🎼 Music Composer Tool
      </h1>

      <p className="text-gray-600 mb-8 text-center max-w-md">
        Generate emotion-based melodies and chord progressions using algorithmic music theory.
      </p>

      <Link to="/composer" className="px-6 py-3 bg-black text-white rounded-lg hover:opacity-90 transition">
        Start Composing
      </Link>
    </div>
  );
}