const steps = [
  { number: 1, title: "Personal Info", description: "Fill in your details" },
  { number: 2, title: "Academic Details & Documents", description: "College, Course, & Supporting Documents" },
  { number: 3, title: "Phone Verification", description: "OTP" },
]

export default function StepIndicator({ currentStep = 1 }) {
    return (
        <>
            {/* mobile ver*/}
            <div className="relative w-full lg:hidden">
            {/* Per-segment connector lines */}
                {steps.slice(0, -1).map((step, index) => {
                    const fromCenterPct = 16.66 + index * 33.33;       //center of left circle
                    const toCenterPct   = fromCenterPct + 33.33;        //center of right circle
                    const isCompleted   = step.number < currentStep;

                    return (
                        <div
                        key={step.number}
                        className={`absolute top-[28px] h-[2px] transition-all duration-300 ${
                            isCompleted ? "bg-[#C9973A]" : "bg-white/20"
                        }`}
                        style={{
                            left:  `calc(${fromCenterPct}% + 28px)`,  //start just after left circle
                            right: `calc(${100 - toCenterPct}% + 28px)`, //end just before right circle
                            width: "auto",
                        }}
                        />
                    );
                })}

                {/* Steps */}
                <div className="flex justify-between items-start relative">
                    {steps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center w-[33.33%]">
                        {/* Circle */}
                        <div
                        className={`w-14 h-14 text-lg rounded-full flex items-center justify-center font-bold border-2 z-10
                        ${
                            step.number < currentStep
                                ? "bg-[#C9973A] border-[#C9973A] text-white"
                                : step.number === currentStep
                                    ? "bg-[#6B0F2B] border-[#C9973A] text-white"
                                    : "bg-white/10 border-white/25 text-white/30"
                        }`}
                        >
                        {/* Line */}
                        {step.number < currentStep ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            step.number
                        )}
                        </div>

                        {/* Labels */}
                        <div className="mt-3 text-center px-2">
                        <p className={`font-semibold text-[11px] leading-tight ${
                            step.number <= currentStep ? "text-white" : "text-white/40"
                        }`}>
                            {step.title}
                        </p>
                        <p className={`text-[9px] mt-1 leading-tight ${
                            step.number === currentStep ? "text-[#C9973A]" : "text-white/30"
                        }`}>
                            {step.description}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {/* desktop ver */}
            <div className="hidden lg:flex flex-col items-start">
                {/* Steps */}
                {steps.map((step, index) => (
                <div key={step.number} className="flex flex-row items-stretch gap-4 w-full">
                    <div className="flex flex-col items-center">
                    
                    {/* Circle */}
                    <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg border-2 z-10 transition-all duration-300 ${
                        step.number < currentStep
                            ? "border-[#C9973A] bg-[#C9973A] text-white"
                            : step.number === currentStep
                                ? "border-[#C9973A] text-white bg-transparent"
                                : "border-white/25 bg-white/10 text-white/30"
                    }`}>
                        {/* Line */}
                        {step.number < currentStep ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        ) : step.number}
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-1 flex-1 min-h-16 transition-all duration-300 ${
                            step.number < currentStep ? "bg-[#C9973A]" : "bg-white/20"
                        }`} />
                    )}
                    </div>
                    {/* Label */}
                    <div className="pt-3 pb-6 min-w-0">
                        <p className={`font-semibold text-sm lg:text-base leading-snug ${
                            step.number <= currentStep ? "text-white" : "text-white/40"
                        }`}>
                            {step.title}
                        </p>
                        <p className={`text-xs mt-0.5 leading-snug ${
                            step.number === currentStep ? "text-[#C9973A]" : "text-white/30"
                        }`}>
                            {step.description}
                        </p>
                    </div>
                </div>
                ))}
            </div>
        </>
    )
}