import { Link } from "react-router-dom"
import Logo from "../../components/Logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

        <div className="flex justify-center mb-6">
          <Logo color="maroon" />
        </div>

        <p className="text-8xl font-bold text-[#7D1128] mb-4">404</p>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link to="/">
          <button className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition shadow">
            Return to Homepage
          </button>
        </Link>

      </div>
    </div>
  )
}
