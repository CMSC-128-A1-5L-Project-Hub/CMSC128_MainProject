"use client";

import React, { useState, useRef } from "react"; // Added useRef
import Modal from "./Modal";
import Button from "./Button"
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
    const stayTypes = [...new Set(accommodation?.rooms?.map((r: any) => r.room_stay_type) || [])];
    const arrangements = [...new Set(accommodation?.rooms?.map((r: any) => r.room_type) || [])];

    const [selectedArrangement, setSelectedArrangement] = useState(arrangements[0] || "");
    const [selectedStayType, setSelectedStayType] = useState(stayTypes[0] || "");

    // --- NEW DYNAMIC FILE STATES ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; progress: number }[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = selectedFiles.map(file => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
            progress: 100 // Set to 100 for now; update this with actual upload logic later
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };
    // -------------------------------

    const selectedRoom = accommodation?.rooms?.find(
        (r: any) => r.room_stay_type === selectedStayType && r.room_type === selectedArrangement
    ) ?? accommodation?.rooms?.[0];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Apply for Occupancy"
            maxWidth={850}
            maxHeight="90vh"
        >
            <div className="flex flex-col gap-8 font-sans">

                {/* 1. PROPERTY INFO - Populated from props */}
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
                                    <p className="text-[11px] text-[#9A7080] max-w-[240px] mt-1 leading-tight">
                                        {accommodation?.accommodation_location}
                                    </p>
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
                                    <span className="text-2xl font-extrabold text-[#C9973A]">
                                        ₱{selectedRoom?.room_rent?.toLocaleString() ?? "—"}
                                    </span>
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

                {/* 2. FORM FIELDS */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-1">Your Application</h4>
                        <p className="text-[10px] text-[#9A7080] mb-6 italic leading-snug">
                            🛈 In order to proceed with the application, please upload the following files for verification purposes
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sans">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-[#C8B0B8] uppercase tracking-wider">Application ID</label>
                                <p className="text-lg font-bold text-[#1A0008]">1</p>
                            </div>

                            <div className="space-y-2">
                                <GradientPillSelect
                                    label="Arrangement"
                                    value={selectedArrangement}
                                    onChange={setSelectedArrangement}
                                    width="w-full"
                                    labelSize="text-[18px]"
                                    optionSize="text-[15px]"
                                    options={arrangements.map((a: any) => ({
                                        value: a,
                                        label: a.charAt(0).toUpperCase() + a.slice(1)
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <GradientPillSelect
                                    label="Stay Type"
                                    value={selectedStayType}
                                    onChange={setSelectedStayType}
                                    width="w-full"
                                    labelSize="text-[18px]"
                                    optionSize="text-[15px]"
                                    options={stayTypes.map((st: any) => ({
                                        value: st,
                                        label: st === "non_transient" ? "Non-Transient" : "Transient"
                                    }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. UPLOAD AREA - NOW DYNAMIC */}
                    <div>
                        <h4 className="text-[11px] font-extrabold text-[#6B0F2B] uppercase tracking-widest mb-4">Supporting Documents</h4>

                        <Card className="bg-[#FAF7F8] border-[#F2D9DF] p-4 md:p-6 flex flex-col lg:flex-row gap-6">
                            {/* Hidden Input Triggered by Div */}
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                            />
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 border-2 border-dashed border-[#D4B0BA] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-[#FFFDFE] transition-all cursor-pointer group"
                            >
                                <div className="bg-[#8C153315] p-3 rounded-xl mb-3">
                                    <IoCloudUploadOutline className="text-[#6B0F2B]" size={24} />
                                </div>
                                <p className="text-xs font-bold text-[#1A0008]">Upload Files</p>
                                <p className="text-[9px] text-[#C8B0B8] mt-1 uppercase font-bold">PDF, JPG or PNG • Max 5MB</p>
                            </div>

                            <div className="flex-[1.5] flex flex-col gap-2">
                                {uploadedFiles.length > 0 ? (
                                    uploadedFiles.map((file, i) => (
                                        <div key={i} className="bg-white border border-[#F2D9DF] rounded-xl p-3 flex items-center gap-3">
                                            <div className="text-[#6B0F2B]"><IoDocumentTextOutline size={18} /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p className="text-[10px] font-bold text-[#1A0008] truncate">{file.name}</p>
                                                    <span className="text-[8px] text-[#C8B0B8]">{file.size}</span>
                                                </div>
                                                <div className="w-full bg-[#F5ECF0] h-1 rounded-full mt-1.5 overflow-hidden">
                                                    <div className={`h-full ${file.progress === 100 ? 'bg-emerald-400' : 'bg-[#6B0F2B]'}`} style={{ width: `${file.progress}%` }} />
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile(i)} className="hover:text-red-500 transition-colors">
                                                {file.progress === 100 ? <IoCheckmarkCircle className="text-emerald-500" size={18} /> : <IoCloseOutline className="text-[#C8B0B8]" size={18} />}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-[#C8B0B8] text-[10px] border border-dashed border-[#F2D9DF] rounded-xl py-4">
                                        No files uploaded yet
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center lg:border-l border-[#F2D9DF] px-4 py-4 lg:py-0">
                                <div className="text-5xl font-extrabold text-[#3D0718]">
                                    {uploadedFiles.length}<span className="text-[#D4B0BA]">/3</span>
                                </div>
                                <p className="text-[9px] font-bold text-[#C8B0B8] uppercase mt-2 tracking-widest">Uploaded</p>
                            </div>
                        </Card>
                    </div>

                    {/* 4. ACTIONS */}
                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-4">
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth={true}
                            className="md:w-auto md:px-14"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}