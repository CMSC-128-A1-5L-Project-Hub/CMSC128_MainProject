import bgDesktop from "../../assets/images/auth-bg-desktop.png"
import bgMobile from "../../assets/images/auth-bg-mobile.png"
import logo from "../../assets/logos/uble-placeholder.svg"
import touch from "../../assets/images/touch.png"
import { Link } from "react-router-dom"

export default function SignUp() {
    return(
        <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:items-center">
            {/* Image (Bg + hand) */}
            <section className="w-full lg:w-1/2 order-2 lg:order-1 relative h-[45vh] sm:h-[55vh] lg:h-screen mt-auto lg:mt-0 overflow-hidden">
                {/* Bg image pag mobile */}
                <img
                    src={bgMobile}
                    alt="background"
                    className="block lg:hidden absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                />
                {/* Bg image pag desktop */}
                <img
                    src={bgDesktop}
                    alt="background"
                    className="hidden lg:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-x-[-1]"
                />
                <img
                    src={touch}
                    alt="hand"
                    className="absolute bottom-0 left-0 h-full object-contain pointer-events-none lg:-bottom-12"
                />
            </section>

            {/* Sign up */}
            <section className="w-full lg:w-1/2 order-1 lg:order-2 flex flex-col justify-center px-6 pt-4 pb-6 max-w-md mx-auto lg:max-w-none lg:mx-0 lg:px-20 lg:py-20 lg:h-screen">
                {/* Header (Logo + Name) */}
                <header className="flex items-center gap-3 mb-10">
                    <img 
                        src={logo}
                        alt="UBLE Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <span className="font-sans font-bold tracking-wide text-black select-none">
                        UBLE
                    </span>
                </header>

                {/* Tagline */}
                <h1 className="font-serif font-bold text-3xl sm:text-5xl text-black leading-tight mb-3">
                    Create Your Space at <br/>
                    <span className="flex items-center gap-2 italic text-[#6B0F2B] font-serif font-bold">
                        {/* Gold bar na horizontal */}
                        <span className="inline-block w-8 h-1 bg-[#C9973A]"></span>
                        UBLE.
                    </span>
                </h1>
                    
                {/* Description */}
                <p className="text-[#9A7080] text-sm sm:text-lg font-sans leading-relaxed mb-5">
                    Find verified dorms near UPLB. Sign up to start your search or manage your listings.
                </p>
                
                {/* Google */}
                <button className="w-full flex items-center justify-center gap-3 border border-[#E8E0E4] rounded-xl py-5 hover:bg-gray-50 transition mb-4 relative">
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="google"
                        className="w-8 h-8 absolute left-5"
                    />
                    <span className="text-base font-bold">Continue with Google</span>
                </button>

                {/* Sign up */}
                <p className="text-sm sm:text-base text-[#B0909A] text-center mb-3">
                    Already have an account?{" "}
                    <Link to ="/auth/signin">
                        <span className="text-[#6B0F2B] font-bold cursor-pointer hover:underline">
                            Sign in here →
                        </span>
                    </Link>
                </p>

                {/* Terms and conditions */}
                <p  className="text-xs sm:text-sm text-[#C8B0B8] text-center">
                    By continuing you agree to our Terms and Privacy Policy.
                </p>

            </section>
        </div>
    )
}