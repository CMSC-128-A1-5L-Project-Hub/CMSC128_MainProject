const steps = [
  { number: 1, title: "Personal Info", description: "Fill in your details", },
  { number: 2, title: "Academic Details & Documents", description: "College, Course, and supporting documents", },
  { number: 3, title: "Phone Verification", description: "OTP", },
]

{/* TODO: Mobile ver */}

export default function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="flex flex-col items-start lg:w-auto">
      {steps.map((step, index) => (
          <div key={step.number} className="flex flex-row items-start gap-4 w-full">
              {/* Circle + vertical connector */}
              <div className="flex flex-col items-center border border-red-500">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base border-2 z-10 transition-all duration-300 border border-red-500 ${
                      step.number < currentStep
                          ? "border-[#C9973A] bg-[#C9973A] text-white"
                          : step.number === currentStep
                          ? "border-[#C9973A] text-white bg-transparent"
                          : "border-white/25 bg-white/10 text-white/30"
                  }`}>
                      {step.number < currentStep ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                      ) : step.number}
                  </div>
                  {index < steps.length - 1 && (
                      <div className={`w-0.5 h-7 lg:h-10 transition-all duration-300 ${
                        step.number < currentStep ? "bg-[#C9973A]" : "bg-white/20"
                      }`} />
                  )}
              </div>

              {/* Text labels — always visible */}
              <div className="pt-2 min-w-0">
                  <p className={`font-semibold text-xs lg:text-sm leading-snug ${
                      step.number == currentStep ? "text-white" : "text-white/40"
                  }`}>
                      {step.title}
                  </p>
                  <p className={`text-[10px] mt-0.5 leading-snug ${
                      step.number == currentStep ? "text-[#C9973A]" : "text-white/30"
                  }`}>
                      {step.description}
                  </p>
              </div>
          </div>
      ))}
    </div>
  )
}