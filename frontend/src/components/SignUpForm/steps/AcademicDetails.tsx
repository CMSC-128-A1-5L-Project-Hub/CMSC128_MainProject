import { useState } from "react";
import FormField from "../shared/FormField";
import FormSelect from "../shared/FormSelect";
import FileUpload from "../shared/FileUpload";
import Button from "../../Button";

export default function AcademicDetails({ data, setData, nextStep, prevStep }: any) {
    const [errors, setErrors] = useState<Record<string,string>>({})

    const handleChange = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const handleNext = () => {
        const newErrors: Record<string,string> = {}

        //check required form fields/selects if user has input
        if (!data.college) newErrors.college = "This field is required"
        if (!data.course) newErrors.course = "This field is required"
        if (!data.studentNumber) {
            newErrors.studentNumber = "This field is required"
        } else if (data.studentNumber.length !==10 ) {
            newErrors.studentNumber = "Must be 10 characters (e.g 2023-12345)"
        }
        if (!data.standing) newErrors.standing = "This field is required"
        if (data.form5 == null) newErrors.form5 = "This field is required"

        setErrors(newErrors)
        //if no errors, proceed to next component
        if (Object.keys(newErrors).length === 0) nextStep()
    }

    const handlePrev = () => {
        prevStep()
    }

    return (
        <>
        {/* Headers */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A0008] mb-1">
            Academic Details & Documents
        </h2>
        <p className="text-sm text-[#9A7080] mb-6">
            Tell us your student information.
        </p>

        {/* Form fields/selects */}
        <div className="grid grid-cols-12 gap-4">
            <FormSelect 
                label="College"
                name="college"
                value={data.college}
                defaultSelect="Select college"
                onChange={handleChange}
                options={[
                    {label: "College of Arts and Sciences", value: "cas"},
                    {label: "College of Agriculture and Food Science", value: "cafs"},
                    {label: "College of Development Communication", value: "cdc"},
                    {label: "College of Economics and Management", value: "cem"},
                    {label: "College of Engineering and Agro-industrial Technology", value: "ceat"},
                    {label: "College of Forestry and Natural Resources", value: "cfnr"},
                    {label: "College of Human Ecology", value: "che"},
                    {label: "College of Veterinary Medicine", value: "cvm"},
                    {label: "College of Public Affairs and Development", value: "cpaf"},
                    {label: "Graduate School", value: "gs"},
                    {label: "School of Environmental Science and Management", value: "sesam"}
                ]}
                className="col-span-6"
                error={errors.college}
            />

            {/* In progress, ang dami ba naman (iffilter ko na lang to based sa selected college) */}
            <FormSelect 
                label="Course"
                name="course"
                value={data.course}
                defaultSelect="Select course"
                onChange={handleChange}
                options={[
                    {label: "Test", value: "test"}
                ]}
                className="col-span-6"
                error={errors.course}
            />

            <FormField 
                label="Student Number"
                name="studentNumber"
                value={data.studentNumber}
                onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9-]/g, "")
                    setData({
                        ...data,
                        studentNumber: val
                    })
                }}
                placeholder="20XX-XXXXX"
                className="col-span-6"
                maxLength={10}
                error={errors.studentNumber}
            />

            <FormSelect 
                label="Standing"
                name="standing"
                value={data.standing}
                defaultSelect="Select standing"
                onChange={handleChange}
                options={[
                    {label: "Freshman", value: "freshman"},
                    {label: "Sophomore", value: "sophomore"},
                    {label: "Junior", value: "junior"},
                    {label: "Senior", value: "senior"}
                ]}
                className="col-span-6"
                error={errors.standing}
            />
            
            <div className="col-span-12">
                <label className="block text-[11px] text-[#6B4050] font-semibold tracking-widest uppercase mb-1.5">
                    Documents
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <FileUpload 
                        label="Upload Form 5"
                        name="form5"
                        required
                        value={data.form5 ?? null}
                        onChange={(file) => setData({
                            ...data,
                            form5: file
                        })}
                        error={errors.form5}
                    />

                    {/* to be modified to allow multiple files */}
                    {/* istructure ko lang pano maoorganize ung files in terms of category (id, birthcert, etc) */}
                    <FileUpload 
                        label="Other Documents"
                        name="other"
                        value={data.other}
                        onChange={(file) => setData({
                            ...data,
                            other:file
                        })}
                    />
                </div>
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