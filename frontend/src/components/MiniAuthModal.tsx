// components/MiniAuthModal.tsx
import Modal from "./Modal";
import Logo from "./Logo";
import { X } from "lucide-react";

interface MiniAuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MiniAuthModal({ open, onClose }: MiniAuthModalProps) {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google/redirect';
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={480} maxHeight="auto">
      <div className="relative p-8 overflow-hidden bg-white rounded-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#6B0F2B] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#9A7080] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 text-gray-400 bg-gray-50/50 hover:bg-gray-100 hover:text-[#6B0F2B] rounded-full transition-all duration-200 ease-out z-10 active:scale-95"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Logo with slight bounce on load */}
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Logo color="#6B0F2B" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-serif font-bold text-3xl text-gray-900 tracking-tight">
            Right Where You{" "}
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#6B0F2B] to-[#9A7080]">
              Belong
            </span>
          </h2>
          <p className="text-[#9A7080] text-sm mt-3 font-medium">
            Sign in to continue your search or manage your listings
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          className="group relative w-full flex items-center justify-center gap-3 border border-[#E8E0E4] rounded-xl py-3.5 bg-white hover:bg-[#FDF5F7] hover:border-[#D8C8CE] transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md overflow-hidden"
          onClick={handleGoogleLogin}
        >
          {/* Subtle hover overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5 absolute left-5 group-hover:scale-110 transition-transform duration-300 ease-out"
          />
          <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#6B0F2B] transition-colors">
            Continue with Google
          </span>
        </button>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#9A7080]">
            Don't have an account?{""}
            <button
              onClick={() => {
                onClose();
                window.location.href = '/auth/signup';
              }}
              className="group inline-flex items-center text-[#6B0F2B] font-semibold hover:text-[#4A0A1E] transition-colors"
            >
              Sign up free
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-1">
                →
              </span>
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-8 px-4">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline decoration-gray-300 hover:text-gray-600 transition-colors">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="underline decoration-gray-300 hover:text-gray-600 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </Modal>
  );
}