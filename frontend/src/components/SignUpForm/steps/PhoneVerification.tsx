import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../shared/FormField";
import Button from "../../Button";

{/* TODO: Mobile ver + otp handling + validation */}

export default function PhoneVerification({ data, setData, prevStep}: any) {
    const [errors, setErrors] = useState<Record<string,string>>({})
    const navigate = useNavigate()

    const handleChange = (e:any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const handleNext = () => {
        const newErrors: Record<string,string> = {}

        if(!data.phoneNumber) newErrors.phoneNumber = "This field is required"

        {/* OTP error handling here */}

        setErrors(newErrors)
        if (Object.keys(newErrors).length === 0) navigate("/studentDashboard")
    }

    const handlePrev = () => prevStep()

    {/* OTP validation here */}
    const handleOTP = () => {

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
            <div className="col-span-7">
                <label className={`block text-[11px] font-semibold tracking-widest uppercase mb-1.5
                    ${errors.phoneNumber 
                    ? "text-red-500" : "text-[#6B4050]"}`}>
                    Phone Number
                </label>

                <div className="flex gap-2 min-w-0">
                    <div className="border border-[#6B0F2B3E] rounded-xl px-3 py-3 text-sm text-gray-600 flex items-center">
                        +63
                    </div>

                    <input
                        type="tel"
                        name="phoneNumber"
                        value={data.phoneNumber}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "")
                            setData({ ...data, phoneNumber: val })
                        }}
                        placeholder="9XXXXXXXXXX"
                        maxLength={10}
                        className={`min-w-0 flex-1 border rounded-xl px-4 py-3 text-sm text-[#6B0F2B] placeholder:text-gray-300 focus:outline-none focus:ring-2 transition
                            ${errors.phoneNumber
                                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                                : "border-[#6B0F2B3E] focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
                            }`}
                    />
                </div>

                {errors.phoneNumber && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.phoneNumber}</p>
                )}
            </div>
            <div className="col-span-5 flex items-center mt-5">
                <Button onClick={handleOTP} variant="primary" size="lg">
                    Request Code
                </Button>
            </div>

            <div className="col-span-5 bg-[#EDD8DE] rounded-3xl p-2 border border-[#6B0F2B1A] mt-1">
                <p className="text-sm text-[#9A7080] px-2">
                    Sending OTP to:{" "}
                    <span className="ml-0.5 text-[#6B0F2B] font-bold">+63{data.phoneNumber.length == 10 ? data.phoneNumber:"XXXXXXXXXX"}</span>
                </p>
            </div>

            <p className="col-span-12 uppercase text-xs font-bold text-[#6B4050] mt-2">
                OTP Verification
            </p>
            <p className="col-span-12 text-[#9A7080] text-xs -mt-4">
                Enter the 6-digit code sent to your phone.
            </p>

            {/* Temp otp field */}
            <FormField 
                name="otp-1"
                value={data.otp}
                onChange={handleChange}
                placeholder=""
                maxLength={1}
                className="col-span-1 -mt-4"
            />
            <FormField 
                name="otp-2"
                value={data.otp}
                onChange={handleChange}
                placeholder=""
                maxLength={1}
                className="col-span-1 -mt-4"
            />
            <FormField 
                name="otp-3"
                value={data.otp}
                onChange={handleChange}
                placeholder=""
                maxLength={1}
                className="col-span-1 -mt-4"
            />
            <FormField 
                name="otp-4"
                value={data.otp}
                onChange={handleChange}
                placeholder=""
                maxLength={1}
                className="col-span-1 -mt-4"
            />
            <FormField 
                name="otp-5"
                value={data.otp}
                onChange={handleChange}
                placeholder=""
                maxLength={1}
                className="col-span-1 -mt-4"
            />
            <FormField 
                name="otp-6"
                value={data.otp}
                onChange={handleChange}
                placeholder=""
                maxLength={1}
                className="col-span-1 -mt-4"
            />

            <p className="col-span-12 text-sm -mt-3 text-[#9A7080]">
                Didn't receive a code?{" "}
                <span className="text-[#6B0F2B] font-bold cursor-pointer hover:underline">
                    Resend OTP
                </span>
            </p>
            
            <div className="col-span-8 bg-[#FAF4F6] rounded-xl p-3 border border-[#6B0F2BA] -mt-2">
                <p className="text-xs text-[#9A7080]">
                    🔒 Your OTP is valid for 5 minutes. Do not share it with anyone.
                </p>
            </div>

        </div>
        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-5">
            <Button onClick={handlePrev} variant="secondary" size="lg">
                Back 
            </Button>
            <Button onClick={handleNext} variant="primary" size="lg">
                Continue
            </Button>
        </div>
        </>
    )
}