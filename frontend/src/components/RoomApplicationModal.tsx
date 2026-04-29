"use client";

import React, { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Card from "./ui/Card";
import {
    IoStar,
    IoCloudUploadOutline,
    IoDocumentTextOutline,
    IoCheckmarkCircle,
    IoCloseOutline
} from "react-icons/io5";
import GradientPillSelect from "./DropDownGradient.tsx";

interface ApplyModalProps {
    open: boolean;
    onClose: () => void;
    accommodation: any;
}

export default function RoomApplicationModal({ open, onClose, accommodation }: ApplyModalProps) {
    const [step, setStep] = useState<"apply" | "verify">("apply");

    const stayTypes = [...new Set(accommodation?.rooms?.map((r: any) => r.room_stay_type) || [])];
    const arrangements = [...new Set(accommodation?.rooms?.map((r: any) => r.room_type) || [])];

    const [selectedArrangement, setSelectedArrangement] = useState(arrangements[0] || "");
    const [selectedStayType, setSelectedStayType] = useState(stayTypes[0] || "");

    // --- DATE STATES ---
    const [moveInDate, setMoveInDate] = useState("2026-03-09");
    const [moveOutDate, setMoveOutDate] = useState("2026-03-19");

    // --- HONESTY DECLARATION STATE ---
    // Using a string state to ensure only one can be active
    const [declaration, setDeclaration] = useState<"accept" | "retract" | null>(null);

    // --- DYNAMIC FILE STATES ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; progress: number }[]>([]);

    // Automatically adjust Move-Out if it becomes invalid compared to Move-In
    useEffect(() => {
        if (new Date(moveOutDate) < new Date(moveInDate)) {
            setMoveOutDate(moveInDate);
        }
    }, [moveInDate, moveOutDate]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = selectedFiles.map(file => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
            progress: 100
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const selectedRoom = accommodation?.rooms?.find(
        (r: any) => r.room_stay_type === selectedStayType && r.room_type === selectedArrangement
    ) ?? accommodation?.rooms?.[0];

    const moveInFee = (selectedRoom?.room_rent || 0) * 3;

    const handleClose = () => {
        setStep("apply");
        setDeclaration(null); // Reset declaration on close
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={step === "apply" ? "Apply for Occupancy" : "VERIFY APPLICATION"}
            maxWidth={850}
            maxHeight="95vh"
        >
            <div className="flex flex-col gap-8 font-sans">
                {step === "apply" ? (
                    <>
                        <Card className="!p-0 overflow-hidden border-none shadow-none">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full md:w-[280px] h-[180px] rounded-3xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={accommodation?.images?.[0]?.image_path || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400"}
                                        alt={accommodation?.accommodation_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 w-full py-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#1A0008]">{accommodation?.accommodation_name}</h3>
                                            <p className="text-[11px] text-[#9A7080] max-w-[240px] mt-1 leading-tight">{accommodation?.accommodation_location}</p>
                                            <div className="flex items-center gap-1 mt-2 text-[#C9973A]">
                                                {[...Array(5)].map((_, i) => (
                                                    <IoStar key={i} size={14} className={i >= Math.floor(accommodation?.avgrating || 0) ? "opacity-30" : ""} />
                                                ))}
                                                <span className="text-[11px] font-bold ml-1 text-[#C8B0B8]">
                                                    {accommodation?.avgrating} ({accommodation?.reviews?.length || 0})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-extrabold text-[#C9973A]">₱{selectedRoom?.room_rent?.toLocaleString() ?? "—"}</span>
                                            <p className="text-[10px] text-[#C8B0B8] font-bold uppercase tracking-wider">per month</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {accommodation?.tags?.map((tag: any) => (
                                            <span key={tag.id} className="px-3 py-1 bg-[#3D0718] text-white text-[9px] rounded-full font-bold uppercase tracking-wider">
                                                {tag.tag_detail}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <hr className="border-[#F5ECF0]" />

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-1">Your Application</h4>
                                <p className="text-[10px] text-[#9A7080] mb-6 italic leading-snug">🛈 In order to proceed with the application, please upload the following files for verification purposes</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-[#C8B0B8] uppercase tracking-wider">Application ID</label>
                                        <p className="text-lg font-bold text-[#1A0008]">1</p>
                                    </div>
                                    <GradientPillSelect label="Arrangement" value={selectedArrangement} onChange={setSelectedArrangement} width="w-full" labelSize="text-[18px]" optionSize="text-[15px]" options={arrangements.map((a: any) => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))} />
                                    <GradientPillSelect label="Stay Type" value={selectedStayType} onChange={setSelectedStayType} width="w-full" labelSize="text-[18px]" optionSize="text-[15px]" options={stayTypes.map((st: any) => ({ value: st, label: st === "non_transient" ? "Non-Transient" : "Transient" }))} />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-4">Supporting Documents</h4>
                                <Card className="bg-[#FAF7F8] border-[#F2D9DF] p-4 md:p-6 flex flex-col lg:flex-row gap-6">
                                    <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} multiple />
                                    <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-[#D4B0BA] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-[#FFFDFE] cursor-pointer">
                                        <IoCloudUploadOutline className="text-[#6B0F2B] mb-3" size={24} />
                                        <p className="text-xs font-bold text-[#1A0008]">Upload Files</p>
                                        <p className="text-[9px] text-[#C8B0B8] mt-1 uppercase font-bold">PDF, JPG or PNG • Max 5MB</p>
                                    </div>
                                    <div className="flex-[1.5] flex flex-col gap-2">
                                        {uploadedFiles.length > 0 ? uploadedFiles.map((file, i) => (
                                            <div key={i} className="bg-white border border-[#F2D9DF] rounded-xl p-3 flex items-center gap-3">
                                                <IoDocumentTextOutline className="text-[#6B0F2B]" size={18} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between"><p className="text-[10px] font-bold text-[#1A0008] truncate">{file.name}</p><span className="text-[8px] text-[#C8B0B8]">{file.size}</span></div>
                                                    <div className="w-full bg-[#F5ECF0] h-1 rounded-full mt-1.5 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${file.progress}%` }} /></div>
                                                </div>
                                                <button onClick={() => removeFile(i)}><IoCheckmarkCircle className="text-emerald-500" size={18} /></button>
                                            </div>
                                        )) : <div className="flex items-center justify-center h-full text-[#C8B0B8] text-[10px] border border-dashed border-[#F2D9DF] rounded-xl py-4">No files uploaded yet</div>}
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center lg:border-l border-[#F2D9DF]">
                                        <div className="text-5xl font-extrabold text-[#3D0718]">{uploadedFiles.length}<span className="text-[#D4B0BA]">/3</span></div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase mt-2 tracking-widest">Uploaded</p>
                                    </div>
                                </Card>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button variant="primary" size="lg" className="md:w-auto md:px-14" onClick={() => setStep("verify")}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-3xl font-bold text-[#1A0008]">{accommodation?.accommodation_name}</h3>
                                <p className="text-[11px] text-[#1A0008] opacity-70 mt-1">{accommodation?.accommodation_location}</p>
                                <div className="flex items-center gap-1 mt-2 text-[#C9973A]">
                                    {[...Array(5)].map((_, i) => (
                                        <IoStar key={i} size={14} className={i >= Math.floor(accommodation?.avgrating || 0) ? "opacity-30" : ""} />
                                    ))}
                                    <span className="text-[11px] font-bold text-[#C8B0B8] ml-1">{accommodation?.avgrating} ({accommodation?.reviews?.length || 0})</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-3">Stay Details</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">Stay Type</p>
                                            <p className="text-sm font-bold text-[#1A0008] capitalize">
                                                {(String(selectedStayType) || "").replace('_', ' ')}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">Arrangement</p>
                                            <p className="text-sm font-bold text-[#1A0008] capitalize">
                                                {String(selectedArrangement || "")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-3">Duration of Stay</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full border border-[#D4B0BA] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#6B0F2B]" />
                                            <p className="text-[8px] text-[#9A7080] mt-1 font-bold">Target Move-In</p>
                                        </div>
                                        <span className="text-[#D4B0BA] font-bold text-xs">to</span>
                                        <div className="flex-1">
                                            <input
                                                type="date"
                                                value={moveOutDate}
                                                min={moveInDate}
                                                onChange={(e) => setMoveOutDate(e.target.value)}
                                                className="w-full border border-[#D4B0BA] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#6B0F2B]"
                                            />
                                            <p className="text-[8px] text-[#9A7080] mt-1 font-bold">Target Move-Out</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-4">Payment Terms</h4>
                                <div className="flex gap-12">
                                    <div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">Move-In Fee</p>
                                        <p className="text-2xl font-extrabold text-[#C9973A]">₱{moveInFee.toLocaleString()}</p>
                                        <p className="text-[8px] text-[#9A7080] font-bold">2 months advance, 1 month deposit</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">Monthly Rent</p>
                                        <p className="text-2xl font-extrabold text-[#C9973A]">₱{selectedRoom?.room_rent?.toLocaleString()}</p>
                                        <p className="text-[8px] text-[#9A7080] font-bold">Per 5th of the month</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#F5ECF0]" />

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest">Honesty Declaration Form</h4>
                                <p className="text-[10px] text-[#1A0008] leading-relaxed opacity-70 italic">I hereby declare that all information and documents I have provided in this application are true, accurate, and complete to the best of my knowledge.
                                    I understand that providing false or misleading information may result in the rejection or cancellation of my application.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Mutually Exclusive Checkboxes */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={declaration === "accept"}
                                            onChange={() => setDeclaration(declaration === "accept" ? null : "accept")}
                                            className="w-4 h-4 rounded border-[#D4B0BA] text-[#6B0F2B] focus:ring-[#6B0F2B]"
                                        />
                                        <span className="text-[10px] font-bold text-[#1A0008]">
                                            I acknowledge this clause
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={declaration === "retract"}
                                            onChange={() => setDeclaration(declaration === "retract" ? null : "retract")}
                                            className="w-4 h-4 rounded border-[#D4B0BA] text-[#6B0F2B] focus:ring-[#6B0F2B]"
                                        />
                                        <span className="text-[10px] font-bold text-[#1A0008]">
                                            I don't acknowledge this clause, and I would like to retract my application
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="secondary" onClick={() => setStep("apply")} className="md:px-8">Back</Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="md:px-14 bg-[#8C1533] text-white"
                                    disabled={declaration !== "accept"}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}