{/* React/type imports */}
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"

{/* Asset imports */}
import bgDesktop from "../../assets/images/signup_form-bg-desktop.png"
import bgMobile from "../../assets/images/signup_form-bg-mobile.png"
import Logo from "../../components/Logo"
import StepIndicator from "../../components/SignUpForm/StepsIndicator"
import PersonalInfo from "../../components/SignUpForm/steps/PersonalInfo"
import AcademicDetails from "../../components/SignUpForm/steps/AcademicDetails"
import PhoneVerification from "../../components/SignUpForm/steps/PhoneVerification"

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
    phoneNumber: string
}

{/* TODO: role-based forms */}

export default function SignUpForm() {
  const navigate = useNavigate()
  
  // For step tracking
  const [step, setStep] = useState(1)
  const [visible, setVisible] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    suffix: "",
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
      // Use FormData for Files
      const payload = new FormData()
      
      // Append standard text fields
      payload.append('first_name', formData.firstName)
      payload.append('last_name', formData.lastName)
      payload.append('suffix', formData.suffix || "")
      payload.append('gender', formData.gender)
      payload.append('emergency_contact_name', formData.emergencyName)
      payload.append('emergency_contact_number', formData.emergencyNumber)
      payload.append('facebook_link', formData.facebook)
      payload.append('college', formData.college)
      payload.append('course', formData.course)
      payload.append('student_number', formData.studentNumber)
      payload.append('academic_standing', formData.standing)
      payload.append('phone_number', formData.phoneNumber)

      // Append files ONLY if they exist
      if (formData.form5) payload.append('form5', formData.form5)
      if (formData.other) payload.append('other', formData.other)

      // Send to AdonisJS Setup Controller
      await api.post('/setup', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Redirect to pending verification on success
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:items-stretch">
      {/* Left side (BG + Branding) */}
      <section className="w-full lg:w-[38%] xl:w-1/3 order-1 lg:order-1 relative h-[35vh] lg:h-screen overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-10 p-6 flex flex-col gap-1 lg:gap-0 justify-between lg:justify-start">
          
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

          <div className="flex flex-col justify-center items-start flex-shrink-0 w-full lg:mt-6">
            <StepIndicator currentStep={step} />
          </div>

        </div>

        <img src={bgDesktop} alt="background" className="hidden lg:block absolute inset-0 w-full h-full object-cover pointer-events-none" />
        <img src={bgMobile} alt="background" className="block lg:hidden absolute inset-0 w-full h-full object-cover pointer-events-none scale-y-[-1]" />
      </section>

      {/* Right side (Form) */}
      <section className="flex-1 order-2 lg:order-2 flex items-center justify-center bg-white px-6 sm:px-10 py-10 lg:py-0 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9973A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C9973A]">
              Step {step} of 3
            </span>
          </div>

          <div className="w-full h-[8px] rounded-full bg-[#F4E7D2]/30 overflow-hidden mb-5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${(step / 3) * 100}%`,
                background: 'linear-gradient(to right, #7D1128, #C9973A)',
              }}
            />
          </div>

          <div className={`transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
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
            {step === 3 && (
              <PhoneVerification 
                data={formData}
                setData={setFormData}
                prevStep={prevStep}
                submitForm={submitForm}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}