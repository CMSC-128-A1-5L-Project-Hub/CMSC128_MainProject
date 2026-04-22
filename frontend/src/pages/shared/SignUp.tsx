import touch from "../../assets/images/touch.png"
import { Link } from "react-router-dom"
import Logo from "../../components/Logo"

export default function SignUp() {
    const handleGoogleSignUp = () => {
        window.location.href = "http://localhost:3333/auth/google/redirect"
    }

    return(
        <div className="h-screen flex flex-col lg:flex-row relative overflow-hidden lg:items-center">

            {/* Left Section — gradient panel (flipped from SignIn) */}
            <section
                className="w-full lg:w-1/2 relative flex-1 lg:h-screen overflow-hidden order-2 lg:order-1"
                style={{
                    background: `
                        radial-gradient(ellipse 90% 70% at -10% 50%, #3D0718 0%, #6B0F2B 25%, #B5344F 50%, transparent 72%),
                        radial-gradient(ellipse 70% 50% at 0% 0%, rgba(140,21,53,0.8) 0%, transparent 60%),
                        radial-gradient(ellipse 70% 50% at 0% 100%, rgba(107,15,43,0.7) 0%, transparent 60%),
                        linear-gradient(90deg, #3D0718 0%, #6B0F2B 16%, #B5344F 32%, #E8A0AA 50%, #F9E8EC 68%, #FDF5F7 82%, #FFFFFF 95%, #FFFFFF 100%)
                    `
                }}
            >
                {/* Mobile gradient override — bottom-to-top */}
                <div
                    className="absolute inset-0 lg:hidden pointer-events-none z-10"
                    style={{
                        background: `
                            radial-gradient(ellipse 100% 60% at 50% 110%, #3D0718 0%, #6B0F2B 25%, #B5344F 50%, transparent 72%),
                            radial-gradient(ellipse 60% 50% at 0% 100%, rgba(140,21,53,0.8) 0%, transparent 60%),
                            radial-gradient(ellipse 60% 50% at 100% 100%, rgba(107,15,43,0.7) 0%, transparent 60%),
                            linear-gradient(0deg, #3D0718 0%, #6B0F2B 16%, #B5344F 33%, #E8A0AA 50%, #F9E8EC 64%, #FDF5F7 76%, #FFFFFF 100%)
                        `
                    }}
                />

                {/* Desktop only: Hard white block on the right edge */}
                <div className="hidden lg:block absolute inset-y-0 right-0 w-8 bg-white pointer-events-none z-30" />

                {/* Desktop only: Soft white fade on right */}
                <div className="hidden lg:block absolute inset-y-0 right-8 w-1/3 bg-gradient-to-l from-white to-transparent pointer-events-none z-20" />

                {/* Mobile only: Soft white fade at top */}
                <div className="lg:hidden absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)",
                        backgroundSize: "55px 55px",
                        WebkitMaskImage: "linear-gradient(270deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 45%)",
                        maskImage: "linear-gradient(270deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 45%)",
                    }}
                />

                {/* Desktop image — on the left, not flipped */}
                <img
                    src={touch}
                    alt="hand"
                    className="hidden lg:block absolute bottom-0 left-0 h-[102%] w-[102%] object-contain object-bottom pointer-events-none z-20"
                />
            </section>

            {/* Right Section — pure white */}
            <section className="w-full lg:w-1/2 flex flex-col justify-center px-6 pt-32 pb-6 max-w-md mx-auto lg:max-w-none lg:mx-0 lg:px-20 lg:py-20 lg:pt-20 lg:h-screen bg-white z-10 flex-shrink-0 order-1 lg:order-2">
                <Logo />

                <h1 className="font-serif font-bold text-3xl sm:text-5xl text-black leading-tight mb-3">
                    Create Your Space at <br/>
                    <span className="flex items-center gap-2 italic text-[#6B0F2B] font-serif font-bold">
                        <span className="inline-block w-8 h-1 bg-[#C9973A]"></span>
                        UBLE.
                    </span>
                </h1>
                    
                <p className="text-[#9A7080] text-sm sm:text-lg font-sans leading-relaxed mb-5">
                    Find verified dorms near UPLB. Sign up to start your search or manage your listings.
                </p>
                
                <button className="w-full flex items-center justify-center gap-3 border border-[#E8E0E4] rounded-xl py-5 bg-white hover:bg-[#FDF5F7] transition mb-4 relative shadow-sm" onClick={handleGoogleSignUp}>
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="google"
                        className="w-8 h-8 absolute left-5"
                    />
                    <span className="text-base font-bold">Continue with Google</span>
                </button>

                <p className="text-sm sm:text-base text-[#B0909A] text-center mb-3">
                    Already have an account?{" "}
                    <Link to="/auth/signin">
                        <span className="text-[#6B0F2B] font-bold cursor-pointer hover:underline">
                            Sign in here →
                        </span>
                    </Link>
                </p>

                <p className="text-xs sm:text-sm text-[#C8B0B8] text-center">
                    By continuing you agree to our Terms and Privacy Policy.
                </p>
            </section>
        </div>
    )
}