export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-800 to-gray-900">
      <div className="text-center text-green-100">
        <h1 className="text-4xl font-bold mb-4">Expense Tracker</h1>
        <p className="text-green-200/70 mb-6">
          Take control of your finances today.
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="text-green-300 hover:underline font-semibold"
          >
            Log In
          </a>
          <a
            href="/register"
            className="text-green-300 hover:underline font-semibold"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
