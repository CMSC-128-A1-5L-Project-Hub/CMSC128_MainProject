{/* React/type imports */}
import { useState } from "react"

{/* Asset imports */}
import bgDesktop from "../../assets/images/signup_form-bg-desktop.png"
import bgMobile from "../../assets/images/signup_form-bg-mobile.png"
import Logo from "../../components/Logo"
import StepIndicator from "../../components/SignUpForm/StepsIndicator"
import PersonalInfo from "../../components/SignUpForm/steps/PersonalInfo"

type SignUpFormData = {
    firstName: string,
    lastName: string,
    suffix?: string,
    email: string,
    gender: string,
    emergencyName: string,
    emergencyNumber: string,
    facebook: string
}

export default function SignUpForm() {
  //for step tracking (progress bar)
  const [step, setStep] = useState(1)

  //form data
  const [formData, setFormData ] = useState<SignUpFormData>({
    firstName: "Test",
    lastName: "Test",
    suffix: "",
    email: "test@up.edu.ph",
    gender: "",
    emergencyName: "",
    emergencyNumber: "",
    facebook: "",
  })

  //handles next and back
  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:items-stretch">
      {/* Left side (BG + Branding) */}
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
          {/* Steps Indicator */}
          <div className="w-full flex justify-center sm:justify-start">
            <StepIndicator currentStep={step} />
          </div>
        </div>

        {/* Backgrounds */}
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

      {/* Right side (Form) */}
      <section className="flex-1 order-2 lg:order-2 flex items-center justify-center bg-white px-6 sm:px-10 py-10 lg:py-0 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Step label */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9973A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C9973A]">
              Step {step} of 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-[8px] rounded-full bg-[#F4E7D2]/30 overflow-hidden mb-5">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(step / 3) * 100}%`, // Step 1 of 3
                background: 'linear-gradient(to right, #7D1128, #C9973A)',
              }}
            />
          </div>

          {/* Form fields */}
          {step === 1 && (
            <PersonalInfo 
              data={formData}
              setData={setFormData}
              nextStep={nextStep}
            />
          )}

          {/* in progress pa ung steps 2 at 3 */}
        </div>
      </section>
    </div>
  )
}