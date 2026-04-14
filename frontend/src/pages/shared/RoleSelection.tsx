import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";
import { FaGraduationCap, FaImage } from "react-icons/fa";

export default function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState("");
    const navigate = useNavigate();

    const handleRoleSelect = (role: string) => {
        setSelectedRole(selectedRole === role ? "" : role);
    };

    const handleSubmit = () => {
        navigate(`/auth/signup/${selectedRole}`);
    }

    return (
        <>
        <PageWrapper>
            <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6 sm:px-10 py-10">
                <div className="absolute top-6 left-6">
                    <Logo />
                </div>

                <h1 className="font-sans text-xl lg:text-2xl text-[#1A0008] font-bold">
                    Select your Role
                </h1>
                <p className="font-sans text-[#9A7080] text-sm lg:text-base mb-5">
                    Let's start tailoring your needs here in{" "}
                    <span className="italic">UBLE</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    {/* Student Card */}
                    <div
                        onClick={() => handleRoleSelect("student")}
                        className={`cursor-pointer flex flex-row items-center border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all
                                ${selectedRole === "student"
                                    ? "border-[#9E2040]"
                                    : null
                                }
                            `}
                    >
                        <FaGraduationCap className="w-12 h-12 text-[#9E2040] mr-2" />
                        <div className="flex flex-col">
                            <h2 className="text-black font-bold text-lg">Student</h2>
                            <h4 className="text-[#888888] font-semibold -mt-2">
                                Get to look for an accommodation
                            </h4>
                        </div>
                        
                    </div>
                    
                    {/* Landlord Card */}
                    <div
                        onClick={() => handleRoleSelect("landlord")}
                        className={`cursor-pointer flex flex-row items-center border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all
                                ${selectedRole === "landlord"
                                    ? "border-[#9E2040]"
                                    : null
                                }
                            `}
                    >
                        <FaImage className="w-12 h-12 text-[#9E2040] mr-2" />
                        <div className="flex flex-col">
                            <h2 className="text-black font-bold text-lg">Landlord</h2>
                            <h4 className="text-[#888888] font-semibold -mt-2">
                                Create Accommodations
                            </h4>
                        </div>
                        
                    </div>
                </div>
                <Button variant="primary" size="lg" onClick={handleSubmit}>
                    Continue
                </Button>
            </div>
        </PageWrapper>
        </>
    );
}