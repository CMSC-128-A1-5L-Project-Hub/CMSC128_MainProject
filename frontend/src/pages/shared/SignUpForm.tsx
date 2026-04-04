import bgDesktop from "../../assets/images/signup_form-bg-desktop.png"
import bgMobile from "../../assets/images/signup_form-bg-mobile.png"
import Logo from "../../components/Logo"
import StepIndicator from "../../components/SignUpForm/StepsIndicator"
import { Link } from "react-router-dom"
import { IoIosArrowBack } from "react-icons/io";
import { GrFormNext } from "react-icons/gr";

{/* Gagawin ko pa component ung steps */}

export default function SignUpForm() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:items-stretch">
      {/* ── Left side (BG + Branding) ── */}
      <section className="w-full lg:w-[38%] xl:w-1/3 order-1 lg:order-1 relative h-[45vh] sm:h-[55vh] lg:h-screen overflow-hidden flex-shrink-0">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 p-5 w-[85%] sm:w-[70%] lg:w-[75%] lg:left-6 lg:translate-x-0">
          <Logo color="white" />
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white leading-tight mt-10">
            Get Started with{" "}
            <span className="block italic text-[#E8C37A] font-serif font-bold">UBLE.</span>
          </h1>
          <p className="text-white opacity-55 text-sm sm:text-base leading-relaxed mt-4 mb-10 lg:mt-6 max-w-[90%] sm:max-w-[80%] break-words">
            Find, apply, and move into your perfect UPLB dorm — all in one place.
          </p>
          {/* Steps */}
          <div className="w-full flex justify-center sm:justify-start">
            <StepIndicator currentStep={1} />
          </div>
        </div>

        <img
          src={bgDesktop}
          alt="background"
          className="hidden lg:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
        <img
          src={bgMobile}
          alt="background"
          className="block lg:hidden absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-y-[-1]"
        />
      </section>

      {/* ── Right side (Form) ── */}
      <section className="flex-1 order-2 lg:order-2 flex items-center justify-center bg-white px-6 sm:px-10 py-10 lg:py-0 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Step label */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9973A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C9973A]">
              Step 1 of 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-0.5 bg-gray-200 rounded-full mb-8">
            <div className="h-0.5 bg-[#C9973A] rounded-full" style={{ width: "33.33%" }} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Create your Account
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Let's start with your basic information. We've pre-filled your Google details.
          </p>

          {/* Google pre-fill notice */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-7">
            {/* Google "G" logo */}
                <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="google"
                    className="w-8 h-8"
                />
            <p className="text-sm text-gray-600">Some fields are pre-filled from your Google account.</p>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* First Name */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
              />
            </div>

            {/* Last Name */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
              />
            </div>

            {/* Suffix */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Suffix
              </label>
              <input
                type="text"
                placeholder="--"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
              />
            </div>

            {/* UP Mail Address */}
            <div className="sm:col-span-7">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                UP Mail Address
              </label>
              <input
                type="email"
                placeholder="username@up.edu.ph"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
              />
            </div>

            {/* Gender */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Gender
              </label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition">
                  <option value="" disabled selected>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Emergency Contact Name */}
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Emergency Contact Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
              />
            </div>

            {/* Emergency Contact Number */}
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Emergency Contact Number
              </label>
              <div className="flex gap-2">
                <div className="border border-gray-300 rounded-xl px-3 py-3 text-sm text-gray-600 bg-gray-50 flex-shrink-0 flex items-center">
                  +63
                </div>
                <input
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
                />
              </div>
            </div>

            {/* Facebook Link */}
            <div className="sm:col-span-12">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Facebook Link
              </label>
              <input
                type="url"
                placeholder="facebook.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition"
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <Link to="/auth/signup">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                <IoIosArrowBack/>
                Back
                </button>
            </Link>

            <button className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#7D1128] text-white text-sm font-semibold hover:bg-[#6a0e22] transition shadow-md shadow-[#7D1128]/30">
              Continue
              <GrFormNext/>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}