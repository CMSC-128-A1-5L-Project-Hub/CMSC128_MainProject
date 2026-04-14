import FormField from "../shared/FormField";
import FormSelect from "../shared/FormSelect";
import PhoneNumber from "../shared/PhoneNumber";
import Button from "../../Button";
import { useState } from "react";

export default function PersonalInfo({ role, data, setData, nextStep }: any) {
    //custom errors per field (if applicable)
    const [errors, setErrors] = useState<Record<string,string>>({})
    
    const handleChange = (e:any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const handleNext = () => {
        //new errors record instance
        const newErrors: Record<string,string> = {}
        
        //check each required field for errors
        //if error, make error entry
        if (role === "student" && !data.gender) newErrors.gender = "This field is required"
        if (role === "student" && !data.emergencyName) newErrors.emergencyName = "This field is required"
        if (role === "student" && !data.emergencyNumber){
            newErrors.emergencyNumber = "This field is required"
        } else if (role === "student" && data.emergencyNumber.length !== 10) {
            newErrors.emergencyNumber = "Must be 10 digits"
        }
        if (role === "landlord" && !data.tin) newErrors.tin = "This field is required"

        setErrors(newErrors)
        //if no error/s were found, next step
        if (Object.keys(newErrors).length === 0) nextStep()
    }

    return (
        <>
        {/* Headers */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A0008] mb-1">
            Create your Account
        </h2>
        <p className="text-sm text-[#9A7080] mb-6">
            Let's start with your basic information. We've pre-filled your Google details.
        </p>

        {/* Google pre-fill notice */}
        <div className="flex items-center gap-3 bg-[#6B0F2B1F] border border-[#6B0F2B1A] rounded-xl px-4 py-3 mb-7">
            {/* Google "G" logo */}
            <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-8 h-8"
            />
            <p className="text-sm text-[#6B4050]">Some fields are pre-filled from your Google account.</p>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-12 gap-4">
            <FormField 
                label="First Name"
                name="firstName"
                value={data.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="col-span-5"
                disabled={true}
            />

            <FormField 
                label="Last Name"
                name="lastName"
                value={data.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="col-span-5"
                disabled={true}
            />

            <FormField 
                label="Suffix"
                name="suffix"
                value={data.suffix}
                onChange={handleChange}
                placeholder="--"
                className="col-span-2"
            />

            <FormField 
                label={role === "student" ? "UP Mail Address" : "Email address"}
                name="email"
                type="email"
                value={data.email}
                onChange={handleChange}
                placeholder="username@up.edu.ph"
                className={role === "manager" ? "col-span-6" : "col-span-7"}
                disabled={true}
            />

            {role === "landlord" && (
                <FormField 
                    label="Tax Identification Number"
                    shorthandLabel="TIN"
                    name="tin"
                    value={data.tin}
                    onChange={handleChange}
                    placeholder="XXX-XXX-XXX-XXX"
                    className="col-span-5"
                    error={errors.tin}
                    maxLength={16}
                />
            )}

            {role === "student" && (
                <FormSelect 
                    label="Gender"
                    name="gender"
                    value={data.gender}
                    defaultSelect="Select gender"
                    onChange={handleChange}
                    options={[
                        {label: "Male", value: "male"},
                        {label: "Female", value: "female"},
                    ]}
                    className="col-span-5"  
                    error={errors.gender}              
                />
            )}
            
            {role === "student" && (
                <FormField 
                    label="Emergency Contact Name"
                    name="emergencyName"
                    value={data.emergencyName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="col-span-6"
                    error={errors.emergencyName}
                />
            )}
            
            {role === "student" && (
                <PhoneNumber 
                    label="Emergency Contact Number"
                    name="emergencyNumber"
                    value={data.emergencyNumber}
                    onChange={handleChange}
                    className="col-span-6 min-w-0"
                    error={errors.emergencyNumber}
                />
            )}
            
            <FormField 
                label="Facebook Link"
                name="facebook"
                value={data.facebook}
                onChange={handleChange}
                placeholder="facebook.com"
                className={role === "manager" ? "col-span-6" : "col-span-12"}
            />
            
        </div>
        {/* Continue button */}
        {/* nireuse ko lang ung button component*/}
        <div className="col-span-12 flex items-center justify-between mt-5">
            <Button onClick={handleNext} variant="primary" size="lg">
                Continue
            </Button>
        </div>
        </>
    )
}