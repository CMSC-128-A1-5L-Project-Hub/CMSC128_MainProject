{/* React/type imports */}
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"

{/* Asset imports */}
import bgDesktop from "../../assets/images/signup_form-bg-desktop.png"
import bgMobile from "../../assets/images/signup_form-bg-mobile.png"

{/* Component imports */}
import Logo from "../../components/Logo"
import StepIndicator from "../../components/SignUpForm/StepsIndicator"
import PersonalInfo from "../../components/SignUpForm/steps/PersonalInfo"
import AcademicDetails from "../../components/SignUpForm/steps/AcademicDetails"
import PhoneVerification from "../../components/SignUpForm/steps/PhoneVerification"
import PageWrapper from "../../components/PageWrapper"

type SignUpFormData = {
    firstName: string
    lastName: string
    suffix?: string
    email: string
    tin?: string
    gender?: string
    emergencyName?: string
    emergencyNumber?: string
    facebook: string
    college?: string
    course?: string
    studentNumber?: string
    standing?: string
    form5: File | null
    other: File | null
    phoneNumber: string
}

const roleSteps = {
  student: {
    steps: [
      {
        key: "personal",
        title: "Personal Information",
        description: "Fill in your details"
      },
      {
        key: "academic",
        title: "Academic Details & Documents",
        description: "College, Course & supporting documents"
      },
      {
        key: "phone",
        title: "Phone Verification",
        description: "OTP"
      }
    ]
  },
  landlord: {
    steps: [
      {
        key: "personal",
        title: "Personal Information",
        description: "Fill in your details"
      },
      {
        key: "phone",
        title: "Phone Verification",
        description: "OTP"
      }
    ]
  },
  manager: {
    steps: [
      {
        key: "personal",
        title: "Personal Information",
        description: "Fill in your details"
      },
      {
        key: "phone",
        title: "Phone Verification",
        description: "OTP"
      }
    ]
  }
}

//role types (strict formatting)
type Role = "student" | "manager" | "landlord"

const stepComponents = {
  personal: PersonalInfo,
  academic: AcademicDetails,
  phone: PhoneVerification
}

export default function SignUpForm() {
  const navigate = useNavigate()
  
  //get role from params
  const { role } = useParams<{role:string}>()
  const currentRole = role as Role

  //get sign up steps based from role
  const formSteps = roleSteps[currentRole]?.steps || []
  const totalSteps = formSteps.length

  //for step tracking (progress bar)
  const [step, setStep] = useState(1)
  //current form step to display
  const currentStep = formSteps[step-1]
  //get component based from current step
  const StepComponent = stepComponents[currentStep?.key as keyof typeof stepComponents]

  //transition handler
  const [visible, setVisible] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    suffix: "",
    tin: "",
    email: "",
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
    phoneNumber: "",
    role: currentRole
  })

  // ─── 1. FETCH GOOGLE DATA ON LOAD ───
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/me')
        const user = response.data.data
        
        // Update the form state with their Google details
        setFormData(prev => ({
          ...prev,
          firstName: user.fname || "",
          lastName: user.lname || "",
          email: user.email || "",
        }))
      } catch (error) {
        console.error("Failed to load user data for pre-fill:", error)
      }
    }
    
    fetchUserData()
  }, [])

  // ─── 2. FINAL SUBMISSION LOGIC ───
  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      const payload = new FormData()

      payload.append('role', 'student') // hardcoded until role selector is built
      payload.append('phone_number', '0' + formData.phoneNumber)
      payload.append('gender', formData.gender)
      payload.append('emergency_contact_name', formData.emergencyName)
      payload.append('emergency_contact_number', formData.emergencyNumber)
      payload.append('college', formData.college)
      payload.append('degree_program', formData.course)      // renamed
      payload.append('student_number', formData.studentNumber) // renamed
      payload.append('facebook_link', formData.facebook)     // drop or keep as extra

      // form5 must be sent as an array 
      if (formData.form5) payload.append('form5[]', formData.form5)
      if (formData.other) payload.append('form5[]', formData.other) // treat 'other' as second enrollment proof

      await api.post('/setup', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate('/pending-verification')
    } catch (error) {
      console.error("Failed to finish setup:", error)
      alert("Failed to submit form. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── STEP HANDLERS ───
  const nextStep = () => {
    setVisible(false)
    setTimeout(() => {
      setStep((prev) => prev + 1)
      setVisible(true)
    }, 200)
  }
  
  const prevStep = () => {
    setVisible(false)
    setTimeout(() => {
      setStep((prev) => prev - 1)
      setVisible(true)
    }, 200)
  }

  {/* To be replaced by an actual screen */}
  if (!formSteps.length) {
    return <div>Invalid role</div>
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:items-stretch">
        {/* Left side (BG + Branding) */}
        <section className="w-full lg:w-[38%] xl:w-1/3 order-1 lg:order-1 relative h-[35vh] lg:h-screen overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 z-10 p-6 flex flex-col gap-1 lg:gap-0 justify-between lg:justify-start">
            
            {/* Left col: logo + text */}
            <div className="flex flex-col justify-center min-w-0 w-[100%] ml-2">
              <Logo color="white" />
              <h1 className="font-serif font-bold text-4xl lg:text-5xl text-white leading-tight mt-4 lg:mt-10">
                Get Started with{" "}
                <span className="italic text-[#E8C37A] font-serif font-bold">UBLE.</span>
              </h1>
              <p className="text-white opacity-55 text-sm lg:text-base leading-relaxed mt-1 lg:mt-4 break-words">
                Find, apply, and move into your perfect UPLB dorm — all in one place.
              </p>
            </div>

            {/* Right col: step indicator (mobile only), full width on desktop */}
            <div className="flex flex-col justify-center items-start flex-shrink-0 w-full lg:mt-6 flex-shrink-0">
              <StepIndicator steps={
                (formSteps.map((s,i) => ({
                  ...s,
                  stepNumber: i+1
                })))
              } currentStep={step} />
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
          <div className="w-full max-w-3xl">
            {/* Step label */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9973A]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C9973A]">
                Step {step} of {totalSteps}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[8px] rounded-full bg-[#F4E7D2]/30 overflow-hidden mb-5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${(step / totalSteps) * 100}%`, // Step 1 of 3
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
              {StepComponent && (
                <StepComponent 
                  role={currentRole}
                  data={formData}
                  setData={setFormData}
                  nextStep={step < totalSteps ? nextStep : undefined}
                  prevStep ={step > 1 ? prevStep : undefined}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}