import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">
        404 - Page Not Found
      </h1>

      <Link to="/" className="text-blue-600 underline">
        Go Home
      </Link>
    </div>
  );
}