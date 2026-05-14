"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "./Modal";
import Button from "./Button";
import Card from "./ui/Card";
import defaultAccommodation from "@/assets/defaults/accommodation.png";

import {
    IoStar,
    IoCloudUploadOutline,
    IoDocumentTextOutline,
    IoCloseOutline,
    IoCheckmarkCircle
} from "react-icons/io5";
import GradientPillSelect from "./DropDownGradient.tsx";
import { api } from "../api/axios";


interface ApplyModalProps {
    open: boolean;
    onClose: () => void;
    accommodation: any;
    selectedRoom: any;
    rooms: any[];
    initialStart: { year: number; month: number; day: number } | null;
    initialEnd: { year: number; month: number; day: number } | null;
    displayStart?: string;
    displayEnd?: string;
    accommodationTags: string[];
    selectedPreferences: string[];
    setSelectedPreferences: React.Dispatch<React.SetStateAction<string[]>>;
    selectedStayType: "transient" | "non_transient";
    setSelectedStayType: React.Dispatch<React.SetStateAction<"transient" | "non_transient">>;
    selectedArrangement: "single" | "double" | "shared";
    setSelectedArrangement: React.Dispatch<React.SetStateAction<"single" | "double" | "shared">>;

    // onToggleAmenity: (amenity: string) => void;
}

export default function RoomApplicationModal({
    open,
    onClose,
    accommodation,
    selectedRoom,
    rooms,
    initialStart,
    initialEnd,
    displayStart,
    displayEnd,
    accommodationTags,
    selectedPreferences,
    setSelectedPreferences,
    selectedStayType,
    setSelectedStayType,
    selectedArrangement,
    setSelectedArrangement,
}: ApplyModalProps) {

    const [step, setStep] = useState<"apply" | "verify">("apply");
    type StayType = "transient" | "non_transient";
    type Arrangement = "single" | "double" | "shared";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const stayTypes: StayType[] = [
        ...new Set(
            (accommodation?.rooms ?? [])
                .map((r: any) => r.roomStayType ?? r.room_stay_type)
                .filter(Boolean)
        ),
    ] as StayType[];

    const arrangements: Arrangement[] = [
        ...new Set(
            (accommodation?.rooms ?? [])
                .map((r: any) => r.roomType ?? r.room_type)
                .filter(Boolean)
        ),
    ] as Arrangement[];

    const [moveInDate, setMoveInDate] = useState("");
    const [moveOutDate, setMoveOutDate] = useState("");
    const [declaration, setDeclaration] = useState<"accept" | "retract" | null>(null);

    // ── Per-requirement document state ────────────────────────────────────────
    type DocRequirement = { id: number; requirementName: string; acceptedFormat: 'pdf' | 'image' | 'any' }
    type DocSlot = { file: File | null; name: string; size: string }

    const { data: docRequirements = [] } = useQuery<DocRequirement[]>({
        queryKey: ["doc-requirements", accommodation?.id],
        queryFn: () => api.get(`/accommodations/${accommodation?.id}/document-requirements`).then((r) => r.data),
        enabled: open && !!accommodation?.id,
    });
    const hasDocRequirements = docRequirements.length > 0

    // slots: Record<requirementId, DocSlot[]> — starts with one empty slot per requirement
    const makeEmptySlot = (): DocSlot => ({ file: null, name: '', size: '' })
    const [docSlots, setDocSlots] = useState<Record<number, DocSlot[]>>({})

    // Sync slots when requirements change (modal open/close, accommodation change, or fetch lands)
    useEffect(() => {
        if (!open) return
        const initial: Record<number, DocSlot[]> = {}
        docRequirements.forEach(req => { initial[req.id] = [makeEmptySlot()] })
        setDocSlots(initial)
    }, [open, accommodation?.id, docRequirements.length])

    const slotInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const handleSlotFileSelect = (reqId: number, slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setDocSlots(prev => {
            const slots = [...(prev[reqId] ?? [makeEmptySlot()])]
            slots[slotIndex] = { file, name: file.name, size: (file.size / 1024).toFixed(0) + 'kb' }
            return { ...prev, [reqId]: slots }
        })
        e.target.value = ''
    }

    const removeSlotFile = (reqId: number, slotIndex: number) => {
        setDocSlots(prev => {
            const slots = [...(prev[reqId] ?? [])]
            slots[slotIndex] = makeEmptySlot()
            return { ...prev, [reqId]: slots }
        })
    }

    const addSlot = (reqId: number) => {
        setDocSlots(prev => ({
            ...prev,
            [reqId]: [...(prev[reqId] ?? []), makeEmptySlot()],
        }))
    }

    const removeSlot = (reqId: number, slotIndex: number) => {
        setDocSlots(prev => {
            const slots = (prev[reqId] ?? []).filter((_, i) => i !== slotIndex)
            return { ...prev, [reqId]: slots.length > 0 ? slots : [makeEmptySlot()] }
        })
    }

    // All filled = every requirement has at least one slot with a file
    const allDocsFilled = !hasDocRequirements || docRequirements.every(req =>
        (docSlots[req.id] ?? []).some(s => s.file !== null)
    )

    const totalRequiredCount = docRequirements.length

    const paymentInputRef = useRef<HTMLInputElement>(null);
    const [paymentFile, setPaymentFile] = useState<{ name: string; size: string; progress: number; status: string } | null>(null);

    const isTransient = selectedStayType === "transient";

    useEffect(() => {
        if (open) {
            if (isTransient) {
                if (initialStart) {
                    const formattedStart = `${initialStart.year}-${String(initialStart.month + 1).padStart(2, '0')}-${String(initialStart.day).padStart(2, '0')}`;
                    setMoveInDate(formattedStart);
                }
                if (initialEnd) {
                    const formattedEnd = `${initialEnd.year}-${String(initialEnd.month + 1).padStart(2, '0')}-${String(initialEnd.day).padStart(2, '0')}`;
                    setMoveOutDate(formattedEnd);
                }
            } else {
                setMoveInDate("");
                setMoveOutDate("");
            }
        }
    }, [open, initialStart, initialEnd, displayStart, displayEnd, isTransient]);

    // Only enforce date ordering for transient (where dates are real date strings)
    useEffect(() => {
        if (isTransient && moveInDate && moveOutDate && new Date(moveOutDate) < new Date(moveInDate)) {
            setMoveOutDate(moveInDate);
        }
    }, [moveInDate, moveOutDate, isTransient]);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            formData.append("accommodationId", String(accommodation.id));

            if (currentRoom?.id != null) {
                formData.append("roomId", String(currentRoom.id));
            }

            formData.append("applicationRoomType", selectedArrangement);
            formData.append("applicationStayType", selectedStayType);

            if (isTransient) {
                formData.append("durationOfStayDays", String(numberOfDays));
                formData.append("moveInDate", moveInDate);
                formData.append("moveOutDate", moveOutDate);
                formData.append("reservationFee", String(reservationFee));
            } else {
                formData.append("moveInFee", String(moveInFee));
            }

            if (selectedPreferences.length > 0) {
                formData.append(
                    "preferredTags",
                    JSON.stringify(selectedPreferences)
                );
            }

            // Attach documents
            const reqIds: (number | null)[] = [];
            const reqNames: string[] = [];

            for (const req of docRequirements) {
                const slots = docSlots[req.id] ?? [];

                for (const slot of slots) {
                    if (!slot.file) continue;

                    formData.append("documents", slot.file);
                    reqIds.push(req.id);
                    reqNames.push(req.requirementName);
                }
            }

            if (reqIds.length > 0) {
                formData.append("requirement_ids", JSON.stringify(reqIds));
                formData.append("requirement_names", JSON.stringify(reqNames));
            }

            const res = await api.post("/applications", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Application submitted:", res.data);

            await queryClient.invalidateQueries({
                queryKey: ["applications"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["student-applications"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["landlord-applications"],
            });

            handleClose();
        } catch (err: any) {
            console.error("Submit failed status:", err.response?.status);
            console.error("Submit failed data:", err.response?.data);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalFooter = (
        <div className="flex flex-row justify-end items-center w-full gap-3">
            {step === "apply" ? (
                <>
                    {(!allDocsFilled ||
                        (isTransient && (!moveInDate || !moveOutDate))) && (
                        <p className="text-[11px] font-bold mr-2 text-[#6B0F2B]">
                            {isTransient &&
                            (!moveInDate || !moveOutDate)
                                ? "Please select stay dates to proceed."
                                : `Please upload all ${totalRequiredCount} required document${
                                    totalRequiredCount !== 1 ? "s" : ""
                                } to proceed.`}
                        </p>
                    )}

                    <Button
                        variant="primary"
                        size="lg"
                        className="rounded-full px-16 bg-[#8C1533] disabled:opacity-50 disabled:grayscale"
                        onClick={() => setStep("verify")}
                        disabled={
                            !allDocsFilled ||
                            (isTransient &&
                                (!moveInDate || !moveOutDate))
                        }
                    >
                        Next
                    </Button>
                </>
            ) : (
                <>
                    <Button
                        variant="secondary"
                        onClick={() => setStep("apply")}
                        className="px-10 rounded-full"
                    >
                        Back
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="primary"
                        size="lg"
                        className={`px-16 rounded-full text-white transition-all ${
                            declaration === "accept" &&
                            (!isTransient || paymentFile) &&
                            !isSubmitting
                                ? "bg-emerald-500"
                                : "bg-[#8C1533] opacity-50 grayscale"
                        }`}
                        disabled={
                            isSubmitting ||
                            declaration !== "accept" ||
                            (isTransient && !paymentFile)
                        }
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </>
            )}
        </div>
    );

    const handlePaymentSelect = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setPaymentFile({
            name: file.name,
            size: (file.size / 1024).toFixed(0) + "kb",
            progress: 100,
            status: "Completed",
        });
    };

    // const removeFile = (index: number) => {
    //     setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    // };

    const currentRoom =
        rooms.find((room: any) => {
            const matchesStay = room.stay === selectedStayType;
            const matchesType = room.type === selectedArrangement;

            const roomPrefs =
                room.tags
                    ?.filter((t: any) => t.type === "preference")
                    .map((t: any) => t.tagDetail ?? t.tag_detail) ?? [];

            const matchesPreferences = selectedPreferences.every((pref) =>
                roomPrefs.includes(pref)
            );

            return matchesStay && matchesType && matchesPreferences;
        }) ??
        rooms.find((room: any) =>
            room.stay === selectedStayType &&
            room.type === selectedArrangement
        ) ??
        selectedRoom;

    // numberOfDays is only meaningful for transient; for non-transient dates are display strings
    const numberOfDays =
        isTransient && moveInDate && moveOutDate
            ? Math.max(
                1,
                Math.ceil(
                    (new Date(moveOutDate).getTime() -
                        new Date(moveInDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : 1;

    const rentPerDay = Number(currentRoom?.rent ?? 0);

    const totalStayCost = isTransient
        ? rentPerDay * numberOfDays
        : rentPerDay;

    const advanceMonths = Number(currentRoom?.advanceMonths ?? 2);
    const depositMonths = Number(currentRoom?.depositMonths ?? 1);
    const rent = Number(currentRoom?.rent ?? 0);

    const moveInFee = rent * (advanceMonths + depositMonths);

    const reservationFeeType =
        currentRoom?.reservationFeeType ?? currentRoom?.reservation_fee_type;

    const reservationFeeValue = Number(
        currentRoom?.reservationFeeValue ?? currentRoom?.reservation_fee_value ?? 0
    );

    const reservationFee =
        reservationFeeType === "percentage"
            ? totalStayCost * reservationFeeValue
            : reservationFeeType === "fixed"
                ? reservationFeeValue
                : 0;

    const currentRoomTags = currentRoom?.tags ?? [];

    const matchingRooms = rooms.filter(
        (r: any) => r.stay === selectedStayType && r.type === selectedArrangement
    );

    const allPreferences = Array.from(
        new Set(
            matchingRooms.flatMap((r: any) =>
                (r.tags ?? [])
                    .filter((t: any) => t.type === "preference")
                    .map((t: any) => t.tagDetail ?? t.tag_detail)
            )
        )
    );

    // Must live after allPreferences is defined
    useEffect(() => {
        setSelectedPreferences((prev) =>
            prev.filter((p) => allPreferences.includes(p))
        );
    }, [selectedStayType, selectedArrangement]);

    const commonPreferences = allPreferences.filter((pref: string) =>
        matchingRooms.every((r: any) =>
            (r.tags ?? [])
                .filter((t: any) => t.type === "preference")
                .map((t: any) => t.tagDetail ?? t.tag_detail)
                .includes(pref)
        )
    );

    const optionalPreferences = allPreferences.filter(
        (pref: string) => !commonPreferences.includes(pref)
    );

    const roomInclusions = currentRoomTags
        .filter((t: any) => t.type === "inclusion")
        .map((t: any) => t.tagDetail ?? t.tag_detail);

    const handleClose = () => {
        setStep("apply");
        setMoveInDate("");
        setMoveOutDate("");
        setDocSlots({});
        setPaymentFile(null);
        setDeclaration(null);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={
                step === "apply"
                    ? (isTransient ? "BOOK FOR TRANSIENT STAY" : "APPLY FOR OCCUPANCY")
                    : (isTransient ? "VERIFY BOOKING" : "VERIFY APPLICATION")
            }
            maxWidth={850}
            footer={modalFooter}
            maxHeight="95vh"
        >
            <div className="flex flex-col gap-6 font-sans p-2">
                {step === "apply" ? (
                    <>
                        {/* Hero Section */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-full md:w-[320px] h-[180px] rounded-3xl overflow-hidden shadow-sm flex-shrink-0">
                                <img
                                    src={accommodation?.imageUrls?.[0] ?? accommodation?.primaryImageUrl ?? defaultAccommodation}
                                    alt={accommodation?.accommodationName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = defaultAccommodation; }}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1A0008] tracking-tight">{accommodation?.accommodationName}</h3>
                                        <p className="text-[11px] text-[#9A7080] mt-1 font-medium">{accommodation?.accommodationLocation}</p>
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
                                        <span className="text-2xl font-black text-[#C9973A]">₱{currentRoom?.rent?.toLocaleString() ?? "—"}</span>
                                        {!isTransient ? (
                                            <p className="text-[11px] text-[#C8B0B8] font-bold uppercase tracking-widest">per month</p>
                                        ) : (
                                            <p className="text-[11px] text-[#C8B0B8] font-bold uppercase tracking-widest">per day</p>
                                        )} 
                                    </div>
                                </div>
                                {/* Amenity Grid */}
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {[...accommodationTags, ...roomInclusions, ...commonPreferences].map((amenity) => (
                                        <span
                                            key={`static-${amenity}`}
                                            className="px-3 py-1 text-[9px] rounded-full font-bold uppercase flex items-center gap-1.5 bg-[#6B0F2B] text-white border border-transparent shadow-sm"
                                        >
                                            <IoCheckmarkCircle size={12} />
                                            {amenity}
                                        </span>
                                    ))}

                                    {selectedPreferences.map((pref) => (
                                        <button
                                            key={`selected-${pref}`}
                                            type="button"
                                            onClick={() =>
                                                setSelectedPreferences((prev) => prev.filter((p) => p !== pref))
                                            }
                                            className="px-3 py-1 text-[9px] rounded-full font-bold uppercase transition-all flex items-center gap-1.5 bg-[#6B0F2B] text-white border border-transparent shadow-sm"
                                        >
                                            <IoCheckmarkCircle size={12} />
                                            {pref}
                                            <IoCloseOutline size={14} className="ml-1 hover:text-white/80" />
                                        </button>
                                    ))}

                                    {optionalPreferences
                                        .filter((pref) => !selectedPreferences.includes(pref))
                                        .map((pref) => (
                                            <button
                                                key={`optional-${pref}`}
                                                type="button"
                                                onClick={() => setSelectedPreferences((prev) => [...prev, pref])}
                                                className="px-3 py-1 text-[9px] rounded-full font-bold uppercase transition-all flex items-center gap-1.5 bg-transparent border-2 border-dashed border-[#D4B0BA] text-[#9A7080] opacity-70 hover:opacity-100"
                                            >
                                                <div className="w-2 h-2 rounded-full border border-[#D4B0BA]" />
                                                {pref}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Your Application Section */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-[12px] font-black text-[#6B0F2B] uppercase tracking-[0.15em]">Your Application</h4>
                                <p className="text-[10px] text-[#9A7080] italic">ⓘ To help manage your accommodation, dormitory personnel may view login info for administrative support.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                                {/* <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#C8B0B8] uppercase tracking-widest">Application ID</label>
                                    <p className="text-xl font-bold text-[#1A0008]">1</p>
                                </div> */}

                                <div className="md:col-span-1">
                                    <GradientPillSelect
                                        label="Stay Type"
                                        value={selectedStayType}
                                        onChange={(v) => setSelectedStayType(v as StayType)}
                                        width="w-full"
                                        labelSize="text-[10px]"
                                        optionSize="text-[13px]"
                                        options={stayTypes.map((st) => ({
                                            value: st,
                                            label: st === "non_transient" ? "Non-Transient" : "Transient",
                                        }))}
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <GradientPillSelect
                                        label="Arrangement"
                                        value={selectedArrangement}
                                        onChange={(v) => setSelectedArrangement(v as Arrangement)}
                                        width="w-full"
                                        labelSize="text-[10px]"
                                        optionSize="text-[13px]"
                                        options={arrangements.map((a) => ({
                                            value: a,
                                            label: a.charAt(0).toUpperCase() + a.slice(1),
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#C8B0B8] uppercase tracking-widest block">Duration of Stay</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            {isTransient ? (
                                                <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full border border-[#F2D9DF] rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#6B0F2B] outline-none" />
                                            ) : (
                                                <p className="text-[11px] font-bold text-[#6B0F2B]">
                                                    {moveInDate || "—"}
                                                </p>
                                            )}
                                            <span className="text-[10px] font-bold text-[#9A7080] uppercase mt-1 block">
                                                {isTransient ? "Target Move-In" : "Expected Move-In"}
                                            </span>
                                        </div>
                                        <span className="text-[#D4B0BA] text-[11px] font-bold uppercase mb-4">to</span>
                                        <div className="flex-1">
                                            {isTransient ? (
                                                <input type="date" value={moveOutDate} min={moveInDate} onChange={(e) => setMoveOutDate(e.target.value)} className="w-full border border-[#F2D9DF] rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#6B0F2B] outline-none" />
                                            ) : (
                                                <p className="text-[11px] font-bold text-[#6B0F2B]">
                                                    {moveOutDate || "—"}
                                                </p>
                                            )}
                                            <span className="text-[10px] font-bold text-[#9A7080] uppercase mt-1 block">
                                                {isTransient ? "Target Move-Out" : "Expected Move-Out"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#C8B0B8] uppercase tracking-widest block">
                                        {isTransient ? "Reservation Fee" : "Move-In Fee"}
                                    </label>
                                    <p className="text-2xl font-black text-[#C9973A]">
                                        ₱{(isTransient ? reservationFee : moveInFee).toLocaleString()}
                                    </p>
                                    {!isTransient && (
                                        <p className="text-[11px] font-bold text-[#9A7080]">
                                            {advanceMonths} {advanceMonths === 1 ? "month" : "months"} advance,{" "}
                                            {depositMonths} {depositMonths === 1 ? "month" : "months"} deposit
                                        </p>
                                    )}
                                    {isTransient && (
                                        <p className="text-[9px] font-bold text-[#9A7080] italic">
                                            Total fee: ₱{rentPerDay.toLocaleString()} × {numberOfDays} days = ₱{totalStayCost.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDocRequirements && <hr className="border-[#F5ECF0]" />}

                        {/* Documents Section — only shown when there are requirements */}
                        {hasDocRequirements && (
                            <div className="">
                                <h4 className="text-[12px] font-black text-[#6B0F2B] uppercase tracking-[0.15em]">Supporting Documents</h4>

                                {/* Dynamic requirement bubbles */}
                                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                                    {docRequirements.map((req) => {
                                        const filled = (docSlots[req.id] ?? []).some(s => s.file !== null)
                                        return (
                                            <span
                                                key={req.id}
                                                className={`px-3 py-1 text-[11px] font-bold rounded-full border flex items-center gap-1.5 transition-all ${
                                                    filled
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-[#FDF2F4] text-[#6B0F2B] border-[#F2D9DF]'
                                                }`}
                                            >
                                                {filled
                                                    ? <IoCheckmarkCircle size={12} className="text-emerald-500 shrink-0" />
                                                    : <span className="w-2 h-2 rounded-full border border-[#D4B0BA] inline-block shrink-0" />
                                                }
                                                {req.requirementName}
                                                <span className="text-[9px] opacity-60 uppercase ml-0.5">
                                                    {req.acceptedFormat === 'pdf' ? '· PDF' : req.acceptedFormat === 'image' ? '· IMG' : ''}
                                                </span>
                                            </span>
                                        )
                                    })}
                                </div>

                                {/* One upload card per requirement */}
                                <div className="space-y-4">
                                    {docRequirements.map((req) => {
                                        const slots = docSlots[req.id] ?? [makeEmptySlot()]
                                        const acceptAttr = req.acceptedFormat === 'pdf'
                                            ? 'application/pdf'
                                            : req.acceptedFormat === 'image'
                                                ? 'image/*'
                                                : 'application/pdf,image/*'
                                        const formatLabel = req.acceptedFormat === 'pdf'
                                            ? 'PDF only'
                                            : req.acceptedFormat === 'image'
                                                ? 'Image only (JPG/PNG)'
                                                : 'PDF or Image'

                                        return (
                                            <div key={req.id}>
                                                <p className="text-[10px] font-black text-[#9A7080] uppercase tracking-widest mb-2">
                                                    {req.requirementName}
                                                </p>
                                                <div className="space-y-2">
                                                    {slots.map((slot, slotIndex) => {
                                                        const inputKey = `${req.id}-${slotIndex}`
                                                        return (
                                                            <Card key={slotIndex} className="bg-[#FAF7F8] border-[#F2D9DF] flex flex-col lg:flex-row gap-4 rounded-2xl !p-4">
                                                                {/* Hidden input */}
                                                                <input
                                                                    type="file"
                                                                    hidden
                                                                    accept={acceptAttr}
                                                                    ref={el => { slotInputRefs.current[inputKey] = el }}
                                                                    onChange={(e) => handleSlotFileSelect(req.id, slotIndex, e)}
                                                                />

                                                                {/* Upload zone */}
                                                                <div
                                                                    onClick={() => slotInputRefs.current[inputKey]?.click()}
                                                                    className="w-full lg:w-[140px] shrink-0 border-2 border-dashed border-[#D4B0BA] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white hover:bg-[#FFFDFE] cursor-pointer transition-all"
                                                                >
                                                                    <IoCloudUploadOutline className="text-[#6B0F2B] mb-1" size={22} />
                                                                    <p className="text-[10px] font-black text-[#1A0008]">
                                                                        {slot.file ? 'Replace' : 'Upload'}
                                                                    </p>
                                                                    <p className="text-[8px] text-[#C8B0B8] uppercase font-bold mt-0.5">{formatLabel} · Max 5MB</p>
                                                                </div>

                                                                {/* File preview */}
                                                                <div className="flex-1 flex items-center">
                                                                    {slot.file ? (
                                                                        <div className="w-full bg-white border border-[#F2D9DF] rounded-xl p-3 flex items-center gap-3">
                                                                            <div className="bg-[#FDF2F4] px-2 py-1 rounded text-[#6B0F2B] font-bold text-[8px] shrink-0">
                                                                                {req.acceptedFormat === 'pdf' ? 'PDF' : req.acceptedFormat === 'image' ? 'IMG' : 'FILE'}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[10px] font-bold text-[#1A0008] truncate">{slot.name}</p>
                                                                                <span className="text-[8px] text-[#C8B0B8] font-bold uppercase">
                                                                                    {slot.size} · <span className="text-emerald-500">Ready</span>
                                                                                </span>
                                                                                <div className="w-full bg-[#F5ECF0] h-1 rounded-full mt-1 overflow-hidden">
                                                                                    <div className="h-full bg-[#6B0F2B] w-full" />
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeSlotFile(req.id, slotIndex)}
                                                                                className="text-[#D4B0BA] hover:text-red-500 shrink-0"
                                                                            >
                                                                                <IoCloseOutline size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full border border-dashed border-[#F2D9DF] rounded-xl py-5 flex items-center justify-center bg-white/50">
                                                                            <p className="text-[10px] font-bold text-[#C8B0B8] uppercase tracking-widest">Waiting for upload…</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Remove extra slot button (only for slots beyond the first) */}
                                                                {slotIndex > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSlot(req.id, slotIndex)}
                                                                        className="self-center text-[#D4B0BA] hover:text-red-500 transition-colors shrink-0"
                                                                        title="Remove this slot"
                                                                    >
                                                                        <IoCloseOutline size={20} />
                                                                    </button>
                                                                )}
                                                            </Card>
                                                        )
                                                    })}
                                                </div>

                                                {/* Add another file for same requirement */}
                                                <button
                                                    type="button"
                                                    onClick={() => addSlot(req.id)}
                                                    className="mt-2 text-[10px] font-bold text-[#6B0F2B] hover:text-[#3D0718] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="text-base leading-none">+</span> Add another file for this requirement
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Uploaded count summary */}
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-3xl font-black text-[#3D0718]">
                                        {docRequirements.filter(req => (docSlots[req.id] ?? []).some(s => s.file !== null)).length}
                                        <span className="text-[#D4B0BA] text-xl">/{totalRequiredCount}</span>
                                    </span>
                                    <p className="text-[9px] font-black text-[#C8B0B8] uppercase tracking-[0.2em]">Requirements Fulfilled</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* VERIFICATION STEP */
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-3xl font-black text-[#1A0008] tracking-tight">{accommodation?.accommodationName}</h3>
                            <p className="text-xs font-bold text-[#9A7080] mt-1">{accommodation?.accommodationLocation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h4 className="text-[11px] font-black text-[#6B0F2B] uppercase tracking-widest mb-4">Stay Details</h4>
                                <div className="space-y-4">
                                    {/* {isTransient && (
                                        <div>
                                            <p className="text-[9px] font-bold text-[#C8B0B8] uppercase tracking-widest">Application ID</p>
                                            <p className="text-lg font-black text-[#1A0008]">1</p>
                                        </div>
                                    )} */}
                                    <div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase tracking-widest">Stay Type</p>
                                        <p className="text-lg font-black text-[#1A0008] capitalize">{(String(selectedStayType) || "").replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase tracking-widest">Arrangement</p>
                                        <p className="text-lg font-black text-[#1A0008] capitalize">{String(selectedArrangement || "")}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#C8B0B8] uppercase tracking-widest block">Duration of Stay</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        {isTransient ? (
                                            <input
                                                type="date"
                                                value={moveInDate}
                                                onChange={(e) => setMoveInDate(e.target.value)}
                                                className="w-full border border-[#F2D9DF] rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#6B0F2B] outline-none"
                                            />
                                        ) : (
                                            <p className="text-[11px] font-bold text-[#6B0F2B]">
                                                {moveInDate || "—"}
                                            </p>
                                        )}
                                        <span className="text-[8px] font-bold text-[#9A7080] uppercase mt-1 block">
                                            {isTransient ? "Target Move-In" : "Expected Move-In"}
                                        </span>
                                    </div>
                                    <span className="text-[#D4B0BA] text-[10px] font-bold uppercase mb-4">to</span>
                                    <div className="flex-1">
                                        {isTransient ? (
                                            <input
                                                type="date"
                                                value={moveOutDate}
                                                min={moveInDate}
                                                onChange={(e) => setMoveOutDate(e.target.value)}
                                                className="w-full border border-[#F2D9DF] rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#6B0F2B] outline-none"
                                            />
                                        ) : (
                                            <p className="text-[11px] font-bold text-[#6B0F2B]">
                                                {moveOutDate || "—"}
                                            </p>
                                        )}
                                        <span className="text-[8px] font-bold text-[#9A7080] uppercase mt-1 block">
                                            {isTransient ? "Target Move-Out" : "Expected Move-Out"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] font-black text-[#6B0F2B] uppercase tracking-widest mb-4">Payment Terms</h4>
                            <div className="flex gap-12">
                                <div>
                                    <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">{isTransient ? "Reservation Fee" : "Move-In Fee"}</p>
                                    <p className="text-3xl font-black text-[#C9973A]">₱{(isTransient ? reservationFee : moveInFee).toLocaleString()}</p>
                                    {!isTransient ? (
                                        <p className="text-[10px] text-[#9A7080] font-bold">{advanceMonths} {advanceMonths === 1 ? "month" : "months"}, {depositMonths} {depositMonths === 1 ? "month" : "months"} deposit</p>
                                    ) : (<p className="text-[10px] text-[#9A7080] font-bold italic">One-time reservation fee</p>)}
                                </div>
                                {!isTransient ? (
                                    <div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">Monthly Rent</p>
                                        <p className="text-3xl font-black text-[#C9973A]">₱{currentRoom?.rent?.toLocaleString()}</p>
                                        <p className="text-[10px] text-[#9A7080] font-bold italic">Per month</p>
                                    </div>
                                ) :
                                    <div>
                                        <p className="text-[9px] font-bold text-[#C8B0B8] uppercase">Total Payment</p>
                                        <p className="text-3xl font-black text-[#C9973A]">₱{totalStayCost.toLocaleString()}</p>
                                        <p className="text-[10px] text-[#9A7080] font-bold italic">For {numberOfDays} {numberOfDays === 1 ? "day" : "days"}</p>
                                    </div>}
                            </div>
                        </div>

                        {/* Functional Proof of Payment Section */}
                        {isTransient && (
                            <div className="space-y-4 pt-4 border-t border-[#F5ECF0]">
                                <h4 className="text-[12px] font-black text-[#6B0F2B] uppercase tracking-widest">Proof of Payment</h4>
                                <Card className="bg-[#FAF7F8] border-[#F2D9DF] p-6 flex flex-col lg:flex-row gap-6 rounded-3xl min-h-[140px]">
                                    <input type="file" hidden ref={paymentInputRef} onChange={handlePaymentSelect} accept="image/*" />

                                    <div
                                        onClick={() => paymentInputRef.current?.click()}
                                        className="flex-1 border-2 border-dashed border-[#D4B0BA] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-[#FFFDFE] cursor-pointer transition-all"
                                    >
                                        <IoCloudUploadOutline className="text-[#6B0F2B] mb-2" size={28} />
                                        <p className="text-sm font-black text-[#1A0008]">Upload Proof</p>
                                        <p className="text-[9px] text-[#C8B0B8] uppercase font-bold">JPG or PNG • Max 5MB</p>
                                    </div>

                                    <div className="flex-[1.5] flex items-center">
                                        {paymentFile ? (
                                            <div className="w-full bg-white border border-[#F2D9DF] rounded-xl p-3 flex items-center gap-3">
                                                <IoDocumentTextOutline className="text-[#6B0F2B]" size={20} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-[#1A0008] truncate">{paymentFile.name}</p>
                                                    <span className="text-[8px] text-[#C8B0B8] font-bold uppercase">{paymentFile.size} • <span className="text-emerald-500">Uploaded</span></span>
                                                    <div className="w-full bg-[#F5ECF0] h-1 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-[#6B0F2B]" style={{ width: `100%` }} />
                                                    </div>
                                                </div>
                                                <button onClick={() => setPaymentFile(null)} className="text-[#D4B0BA] hover:text-red-500"><IoCloseOutline size={18} /></button>
                                            </div>
                                        ) : (
                                            <div className="w-full border border-dashed border-[#D4B0BA] rounded-xl py-8 flex items-center justify-center bg-white/50">
                                                <p className="text-[10px] font-bold text-[#C8B0B8] uppercase tracking-widest">Waiting for upload...</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center lg:border-l border-[#F2D9DF] px-4 text-center">
                                        {paymentFile ? (
                                            <>
                                                <IoCheckmarkCircle className="text-emerald-500 mb-1" size={40} />
                                                <p className="text-[9px] font-black text-[#9A7080] uppercase leading-tight">Payment proof is successfully uploaded.</p>
                                            </>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border-4 border-[#F5ECF0] border-t-[#D4B0BA] animate-spin opacity-30" />
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-[#F5ECF0]">
                            <h4 className="text-[12px] font-black text-[#6B0F2B] uppercase tracking-widest">Honesty Declaration Form</h4>
                            <p className="text-[11px] text-[#1A0008] leading-relaxed opacity-80 italic">
                                I hereby declare that all information and documents I have provided in this application are true, accurate, and complete to the best of my knowledge.
                                I understand that providing false or misleading information may result in the rejection or cancellation of my application.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={declaration === "accept"} onChange={() => setDeclaration(declaration === "accept" ? null : "accept")} className="w-5 h-5 rounded border-[#D4B0BA] text-[#6B0F2B] focus:ring-[#6B0F2B]" />
                                    <span className="text-[11px] font-bold text-[#1A0008]">I acknowledge this clause</span>
                                </label>
                                {/* <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={declaration === "retract"} onChange={() => setDeclaration(declaration === "retract" ? null : "retract")} className="w-5 h-5 rounded border-[#D4B0BA] text-[#6B0F2B] focus:ring-[#6B0F2B]" />
                                    <span className="text-[11px] font-bold text-[#1A0008]">I don't acknowledge this clause, and I would like to retract my application</span>
                                </label> */}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
