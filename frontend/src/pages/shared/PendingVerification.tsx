import { Link } from "react-router-dom";
import Logo from "../../components/Logo";

export default function PendingVerification() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        
        <div className="flex justify-center mb-6">
          <Logo color="maroon" />
        </div>

        <div className="w-16 h-16 bg-[#C9973A]/10 text-[#C9973A] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Under Review</h1>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Thank you for completing your profile! Our Super Admins are currently verifying your Form 5 and academic details. This process usually takes 1-2 business days.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
          <p className="text-xs text-blue-700 font-medium">
            We will send an email to your UP Mail address once your account has been approved.
          </p>
        </div>

        <Link to="/login">
          <button className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition shadow">
            Return to Login
          </button>
        </Link>
        
      </div>
    </div>
  );
}