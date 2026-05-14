import { useState, useRef } from "react";
import { api } from "../../../api/axios"; 
import Button from "../../Button";

// Set to false to re-enable OTP verification via Semaphore SMS
const SKIP_OTP = false

export default function PhoneVerification({ data, setData, prevStep, submitForm, isSubmitting }: any) {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])
    const [errors, setErrors] = useState<Record<string,string>>({})
    
    // New loading states for OTP API calls
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")

    // ─── THE OTP REQUEST (SEMAPHORE) ───
    const handleOTP = async () => {
        // Clear previous messages
        setErrors({})
        setSuccessMsg("")

        if (data.phoneNumber.length < 10) {
            setErrors({ phoneNumber: "Please enter a valid 10-digit number" })
            return
        }

        setIsSendingOtp(true)
        try {
            // Send to Adonis, add a zero at the start
            await api.post('/auth/send-otp', { 
                phoneNumber: '0' + data.phoneNumber 
            })
            
            setSuccessMsg("OTP sent! Please check your phone.")
        } catch (error: any) {
            // Catch rate-limit errors or Semaphore failures
            setErrors({ 
                phoneNumber: error.response?.data?.message || "Failed to send OTP. Please try again." 
            })
        } finally {
            setIsSendingOtp(false)
        }
    }

    // ─── THE VERIFICATION CHECK ───
    const handleNext = async () => {
        const newErrors: Record<string,string> = {}
        const otpValue = otp.join("")

        if (!data.phoneNumber) newErrors.phoneNumber = "This field is required"
        else if (!/^9\d{9}$/.test(data.phoneNumber)) newErrors.phoneNumber = "Must be a valid PH mobile number starting with 9 (e.g. 9171234567)"

        if (!SKIP_OTP) {
            if (otpValue.length < 6) newErrors.otp = "Please enter the complete 6-digit code"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        if (SKIP_OTP) {
            submitForm()
            return
        }

        // Talk to AdonisJS to verify the code
        setIsVerifyingOtp(true)
        setErrors({})
        try {
            await api.post('/auth/verify-sms', {
                phoneNumber: '0' + data.phoneNumber,
                code: otpValue
            })

            // The phone is now verified. Submit the whole form to database
            submitForm()

        } catch (error: any) {
            // AdonisJS rejected the code (e.g., "Invalid OTP code" or "Expired")
            setErrors({ 
                otp: error.response?.data?.message || "Invalid OTP. Please try again." 
            })
        } finally {
            setIsVerifyingOtp(false)
        }
    }

    const handlePrev = () => prevStep()

    const handleOTPChange = (index: number, val: string) => {
        if (!/^\d?$/.test(val)) return
        const next = [...otp]
        next[index] = val
        setOtp(next)
        if (val && index < 5) otpRefs.current[index + 1]?.focus()
    }

    {/* For when the user deletes or uses backspace */}
    {/* Expected behavior: focused input moves to previous input field 
        assuming that prev exists    
    */}
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0){
            otpRefs.current[index-1]?.focus()
        }
    }

    return (
        <>
        {/* Headers */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A0008] mb-1">
            Phone Number Verification
        </h2>
        <p className="text-sm text-[#9A7080] mb-6">
            Authenticate your phone to help us verify that your number exists.
        </p>

        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
                {/* Phone number field */}
                <label className={`block text-[11px] font-semibold tracking-widest uppercase mb-1.5
                    ${errors.phoneNumber 
                    ? "text-red-500" : "text-[#6B4050]"}`}>
                    Phone Number
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 flex-1">
                        <div className="border border-[#6B0F2B3E] rounded-xl px-4 py-3 text-sm text-gray-600 flex items-center flex-shrink-0">
                            +63
                        </div>

                        <input
                            type="tel"
                            name="phoneNumber"
                            value={data.phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").replace(/^0+/, "")
                                setData({ ...data, phoneNumber: val })
                            }}
                            placeholder="9XXXXXXXXXX"
                            maxLength={10}
                            className={`flex-1 min-w-0 border rounded-xl px-4 py-3 text-sm text-[#6B0F2B] placeholder:text-gray-300 focus:outline-none focus:ring-2 transition
                                ${errors.phoneNumber
                                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                                    : "border-[#6B0F2B3E] focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
                                }`}
                        />
                    </div>

                    {/* Error label (for desktop) */}
                    {errors.phoneNumber && (
                        <p className="sm:hidden text-red-500 text-[10px]">{errors.phoneNumber}</p>
                    )}

                    {/* Request code button */}
                    <Button 
                        onClick={handleOTP} 
                        variant="primary" 
                        size="lg" 
                        className="w-auto flex-shrink-0"
                        disabled={isSendingOtp || SKIP_OTP}
                    >
                        {isSendingOtp ? "Sending..." : "Request Code"}
                    </Button>
                </div>

                {/* Error label (for mobile) */}
                {errors.phoneNumber && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.phoneNumber}</p>
                )}
                {/* Success Feedback for the user */}
                {successMsg && !errors.phoneNumber && (
                    <p className="text-green-600 font-medium text-[11px] mt-1">{successMsg}</p>
                )}
            </div>

            {/* Sending OTP label */}
            <div className="col-span-12 bg-[#EDD8DE] rounded-3xl px-4 py-2.5 border border-[#6B0F2B1A] lg:w-fit">
                <p className="text-sm text-[#9A7080]">
                    Sending OTP to:{" "}
                    <span className="ml-0.5 text-[#6B0F2B] font-bold">+63{data.phoneNumber.length === 10 ? data.phoneNumber:"XXXXXXXXXX"}</span>
                </p>
            </div>

            {/* OTP fields */}
            <p className="col-span-12 uppercase text-xs font-bold text-[#6B4050] mt-2">
                OTP Verification
            </p>
            <p className="col-span-12 text-[#9A7080] text-xs -mt-4">
                Enter the 6-digit code sent to your phone.
            </p>

            <div className="col-span-12 flex gap-2 sm:gap-3 -mt-2">
                {otp.map((digit, i) => (
                    <input 
                        key={i}
                        ref={el => {otpRefs.current[i] = el as HTMLInputElement | null}}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOTPChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`
                            w-full aspect-square max-w-[56px] text-center text-xl font-bold rounded-2xl border-2 focus:outline-none focus:ring-2 transition
                            ${digit
                                ? "border-[#6B0F2B] text-[#6B0F2B] focus:ring-[#C9973A]/40 bg-gradient-to-b from-[#FDF5F7] to-[#F5ECF0]"
                                : "border-[#6B0F2B3E] text-[#6B0F2B] focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
                            }    
                        `}
                    />
                ))}
            </div>
            {/* Error label for OTP fields */}
            {errors.otp && (
                <p className="col-span-12 text-red-500 text-[10px] -mt-3">
                    {errors.otp}
                </p>
            )}

            {/* Resend OTP */}
            <p className="col-span-12 text-sm -mt-3 text-[#9A7080]">
                Didn't receive a code?{" "}
                <span 
                    onClick={SKIP_OTP ? undefined : handleOTP}
                    className={`font-bold transition ${isSendingOtp || SKIP_OTP ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B0F2B] cursor-pointer hover:underline'}`}
                >
                    {isSendingOtp ? "Sending..." : "Resend OTP"}
                </span>
            </p>
            
            {/* OTP reminder */}
            <div className="col-span-12 sm:col-span-8 bg-[#FAF4F6] rounded-xl p-3 border border-[#6B0F2BA] -mt-2">
                <p className="text-xs text-[#9A7080]">
                    🔒 Your OTP is valid for 5 minutes. Do not share it with anyone.
                </p>
            </div>

        </div>
        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-5">
            <Button onClick={handlePrev} variant="secondary" size="lg" disabled={isSubmitting || isVerifyingOtp}>
                ← Back 
            </Button>
            <Button onClick={handleNext} variant="primary" size="lg" disabled={isSubmitting || isVerifyingOtp}>
                {isVerifyingOtp ? 'Verifying...' : isSubmitting ? 'Submitting...' : SKIP_OTP ? 'Submit' : 'Verify & Continue'}
            </Button>
        </div>
        </>
    )
}