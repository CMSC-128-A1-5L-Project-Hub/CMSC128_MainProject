const steps = [
  { number: 1, title: "Personal Info", description: "Fill in your details", },
  { number: 2, title: "Academic Details & Documents", description: "College, Course, and supporting documents", },
  { number: 3, title: "Phone Verification", description: "OTP", },
]

export default function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="flex lg:flex-col flex-row items-start justify-between lg:justify-start w-full lg:w-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex lg:flex-row flex-col items-center lg:items-start lg:gap-4 flex-1 lg:flex-none">
          {/* Circle + connector lines */}
          <div className="flex lg:flex-col flex-row items-center w-full lg:w-auto">
            <div
              className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base border-2 z-10 transition-all duration-300 ${
                step.number < currentStep
                  ? "border-[#C9973A] bg-[#C9973A] text-white"
                  : step.number === currentStep
                  ? "border-[#C9973A] text-white bg-transparent"
                  : "border-white/25 bg-white/10 text-white/30"
              }`}
            >
              {step.number < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <>
                {/* Vertical connector (desktop) */}
                <div
                  className={`hidden lg:block w-0.5 h-14 transition-all duration-300 ${
                    step.number < currentStep ? "bg-[#C9973A]" : "bg-white/20"
                  }`}
                />
                {/* Horizontal connector (mobile) */}
                <div
                  className={`block lg:hidden h-0.5 flex-1 transition-all duration-300 ${
                    step.number < currentStep ? "bg-[#C9973A]" : "bg-white/20"
                  }`}
                />
              </>
            )}
          </div>

          {/* Text labels — desktop only */}
          <div className="hidden lg:block pt-1.5">
            <p
              className={`font-semibold text-sm leading-snug ${
                step.number <= currentStep ? "text-white" : "text-white/40"
              }`}
            >
              {step.title}
            </p>
            <p
              className={`text-xs mt-0.5 leading-snug ${
                step.number === currentStep ? "text-[#C9973A]" : "text-white/30"
              }`}
            >
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}