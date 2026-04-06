{/* React/type imports */}
import { useState } from "react"

{/* Asset imports */}
import bgDesktop from "../../assets/images/signup_form-bg-desktop.png"
import bgMobile from "../../assets/images/signup_form-bg-mobile.png"
import Logo from "../../components/Logo"
import StepIndicator from "../../components/SignUpForm/StepsIndicator"
import PersonalInfo from "../../components/SignUpForm/steps/PersonalInfo"
import AcademicDetails from "../../components/SignUpForm/steps/AcademicDetails"

type SignUpFormData = {
    firstName: string
    lastName: string
    suffix?: string
    email: string
    gender: string
    emergencyName: string
    emergencyNumber: string
    facebook: string
    college: string
    course: string
    studentNumber: string
    standing: string
    form5: File | null
    other: File | null
}

export default function SignUpForm() {
  //for step tracking (progress bar)
  const [step, setStep] = useState(1)

  //transition handler
  const [visible, setVisible] = useState(true)

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
    college: "",
    course: "",
    studentNumber: "",
    standing: "",
    form5: null,
    other: null,
  })

  //handles next and back
  const nextStep = () => {
    setVisible(false)
    setTimeout(() => {
      setStep((prev) => prev + 1)
      setVisible(true)
    }, 200) //timeout duration
  }
  const prevStep = () => {
    setVisible(false)
    setTimeout(() => {
      setStep((prev) => prev - 1)
      setVisible(true)
    }, 200)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:items-stretch">
      {/* Left side (BG + Branding) */}
      <section className="w-full lg:w-[38%] xl:w-1/3 order-1 lg:order-1 relative h-[35vh] lg:h-screen overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-10 p-6 flex flex-row lg:flex-col gap-1 lg:gap-0 justify-between lg:justify-start">
          
          {/* Left col: logo + text */}
          <div className="flex flex-col justify-center min-w-0 w-[62%] lg:w-[100%]">
            <Logo color="white" />
            <h1 className="font-serif font-bold text-4xl lg:text-5xl text-white leading-tight mt-4 lg:mt-10">
              Get Started with{" "}
              <span className="italic text-[#E8C37A] font-serif font-bold">UBLE.</span>
            </h1>
            <p className="text-white opacity-55 text-sm lg:text-base leading-relaxed mt-4 break-words">
              Find, apply, and move into your perfect UPLB dorm — all in one place.
            </p>
          </div>

          {/* Right col: step indicator (mobile only), full width on desktop */}
          <div className="flex flex-col justify-center items-start flex-shrink-0 w-[40%] lg:w-full lg:mt-6 flex-shrink-0 border border-red-500">
            <StepIndicator currentStep={step} />
          </div>

        </div>

        {/* Backgrounds */}
        <img src={bgDesktop} alt="background"
          className="hidden lg:block absolute inset-0 w-full h-full object-cover pointer-events-none" />
        <img src={bgMobile} alt="background"
          className="block lg:hidden absolute inset-0 w-full h-full object-cover pointer-events-none scale-y-[-1]" />
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
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${(step / 3) * 100}%`, // Step 1 of 3
                background: 'linear-gradient(to right, #7D1128, #C9973A)',
              }}
            />
          </div>

          {/* Transition div for navigating between form components */}
          <div 
            className={`transition-all duration-200 ${
              visible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-2"
            }`}
          >
            {step === 1 &&
              <PersonalInfo 
                data={formData}
                setData={setFormData}
                nextStep={nextStep}
              />
            }
            {step === 2 && (
              <AcademicDetails 
                data={formData}
                setData={setFormData}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
          </div>

          {/* in progress pa ung steps 2 at 3 */}
        </div>
      </section>
    </div>
  )
}