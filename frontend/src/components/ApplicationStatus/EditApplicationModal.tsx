// frontend/src/components/ApplicationStatus/EditApplicationModal.tsx
import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Application } from '@/interfaces/application';

interface EditApplicationModalProps {
    open: boolean;
    onClose: () => void;
    application: Application | null;
    onSubmit: (id: number, data: Partial<Application>) => void;
    isSubmitting?: boolean;
}

// Custom Calendar Component
interface SimpleCalendarProps {
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

function SimpleCalendar({ selectedDate, onSelect, minDate, maxDate }: SimpleCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return { year: today.getFullYear(), month: today.getMonth() };
    });

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const isDateDisabled = (date: Date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const isDateSelected = (date: Date) => {
        return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
    };

    const handlePrevMonth = () => {
        if (currentMonth.month === 0) {
            setCurrentMonth({ year: currentMonth.year - 1, month: 11 });
        } else {
            setCurrentMonth({ ...currentMonth, month: currentMonth.month - 1 });
        }
    };

    const handleNextMonth = () => {
        if (currentMonth.month === 11) {
            setCurrentMonth({ year: currentMonth.year + 1, month: 0 });
        } else {
            setCurrentMonth({ ...currentMonth, month: currentMonth.month + 1 });
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
    const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className="bg-white rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition">
                    <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                    {monthNames[currentMonth.month]} {currentMonth.year}
                </span>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition">
                    <ChevronRight size={16} className="text-gray-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-[10px] font-semibold text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
                {emptyCells.map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                ))}
                {days.map((day) => {
                    const date = new Date(currentMonth.year, currentMonth.month, day);
                    const disabled = isDateDisabled(date);
                    const selected = isDateSelected(date);

                    return (
                        <button
                            key={day}
                            onClick={() => !disabled && onSelect(date)}
                            disabled={disabled}
                            className={`
                                h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all mx-auto
                                ${selected ? "bg-[#6B0F2B] text-white shadow-sm" : ""}
                                ${!disabled && !selected ? "text-gray-700 hover:bg-gray-100" : ""}
                                ${disabled ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function EditApplicationModal({
    open,
    onClose,
    application,
    onSubmit,
    isSubmitting = false,
}: EditApplicationModalProps) {
    const [roomType, setRoomType] = useState<Application['applicationRoomType']>(application?.applicationRoomType || 'single');
    const [stayType, setStayType] = useState<Application['applicationStayType']>(application?.applicationStayType || 'non_transient');
    const [moveInDate, setMoveInDate] = useState<Date | null>(null);
    const [moveOutDate, setMoveOutDate] = useState<Date | null>(null);
    const [showMoveInCalendar, setShowMoveInCalendar] = useState(false);
    const [showMoveOutCalendar, setShowMoveOutCalendar] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableRoomTypes, setAvailableRoomTypes] = useState<Application['applicationRoomType'][]>([]);
    const [availableStayTypes, setAvailableStayTypes] = useState<Application['applicationStayType'][]>([]);
    const [error, setError] = useState<string>('');
    
    // Store original values
    const [originalValues, setOriginalValues] = useState<{
        roomType: Application['applicationRoomType'];
        stayType: Application['applicationStayType'];
        moveInDate: string | null;
        moveOutDate: string | null;
        tags: string[];
    } | null>(null);

    const moveInCalendarRef = useRef<HTMLDivElement>(null);
    const moveOutCalendarRef = useRef<HTMLDivElement>(null);

    // Close calendars when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (moveInCalendarRef.current && !moveInCalendarRef.current.contains(event.target as Node)) {
                setShowMoveInCalendar(false);
            }
            if (moveOutCalendarRef.current && !moveOutCalendarRef.current.contains(event.target as Node)) {
                setShowMoveOutCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (application) {
            const originalRoomType = application.applicationRoomType;
            const originalStayType = application.applicationStayType;
            const originalMoveInDate = application.moveInDate;
            const originalMoveOutDate = application.moveOutDate;
            const originalTags = application.preferredTags || [];
            
            setRoomType(originalRoomType);
            setStayType(originalStayType);
            setMoveInDate(originalMoveInDate ? new Date(originalMoveInDate) : null);
            setMoveOutDate(originalMoveOutDate ? new Date(originalMoveOutDate) : null);
            setSelectedTags([...originalTags]);
            
            setOriginalValues({
                roomType: originalRoomType,
                stayType: originalStayType,
                moveInDate: originalMoveInDate,
                moveOutDate: originalMoveOutDate,
                tags: [...originalTags],
            });
            
            if (application.accommodation?.rooms) {
                const roomTypes = new Set<Application['applicationRoomType']>();
                const stayTypes = new Set<Application['applicationStayType']>();
                const tags = new Set<string>();
                
                application.accommodation.rooms.forEach(room => {
                    // Get unique room types offered
                    if (room.roomType === 'single' || room.roomType === 'double' || room.roomType === 'shared') {
                        roomTypes.add(room.roomType);
                    }
                    // Get unique stay types offered
                    if (room.roomStayType === 'transient' || room.roomStayType === 'non_transient') {
                        stayTypes.add(room.roomStayType);
                    }
                    // Get tags
                    room.tags?.forEach(tag => tags.add(tag.tagDetail));
                });
                
                setAvailableRoomTypes(Array.from(roomTypes));
                setAvailableStayTypes(Array.from(stayTypes));
                setAvailableTags(Array.from(tags));
                
                // If current stay type is not available, set to first available or keep original
                if (!stayTypes.has(stayType) && stayTypes.size > 0) {
                    setStayType(Array.from(stayTypes)[0]);
                }
            } else {
                setAvailableRoomTypes(['single', 'double', 'shared']);
                setAvailableStayTypes(['non_transient', 'transient']);
            }
        }
    }, [application]);

    const hasChanges = (): boolean => {
        if (!originalValues) return false;
        
        if (roomType !== originalValues.roomType) return true;
        if (stayType !== originalValues.stayType) return true;
        if (JSON.stringify(selectedTags.sort()) !== JSON.stringify(originalValues.tags.sort())) return true;
        
        if (stayType === 'transient') {
            const currentMoveIn = moveInDate ? moveInDate.toISOString().split('T')[0] : null;
            const currentMoveOut = moveOutDate ? moveOutDate.toISOString().split('T')[0] : null;
            const originalMoveIn = originalValues.moveInDate ? originalValues.moveInDate.split('T')[0] : null;
            const originalMoveOut = originalValues.moveOutDate ? originalValues.moveOutDate.split('T')[0] : null;
            
            if (currentMoveIn !== originalMoveIn) return true;
            if (currentMoveOut !== originalMoveOut) return true;
        }
        
        return false;
    };

    const handleSubmit = () => {
        if (!roomType) {
            setError('Please select a room type');
            return;
        }
        if (!stayType) {
            setError('Please select a stay type');
            return;
        }
        
        if (!hasChanges()) {
            setError('No changes were made to your application');
            return;
        }
        
        if (stayType === 'transient') {
            if (!moveInDate || !moveOutDate) {
                setError('Please select both move-in and move-out dates');
                return;
            }
            if (moveOutDate <= moveInDate) {
                setError('Move-out date must be after move-in date');
                return;
            }
        }

        setError('');
        
        const updateData: Partial<Application> = {
            applicationRoomType: roomType,
            applicationStayType: stayType,
            preferredTags: selectedTags,
        };
        
        if (stayType === 'transient') {
            updateData.moveInDate = moveInDate ? moveInDate.toISOString().split('T')[0] : null;
            updateData.moveOutDate = moveOutDate ? moveOutDate.toISOString().split('T')[0] : null;
            updateData.durationOfStayDays = null;
        } else {
            updateData.durationOfStayDays = null;
            updateData.moveInDate = null;
            updateData.moveOutDate = null;
        }
        
        onSubmit(application!.id, updateData);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const roomTypeLabels: Record<string, string> = {
        single: 'Single',
        double: 'Double',
        shared: 'Shared'
    };

    const stayTypeLabels: Record<string, string> = {
        transient: 'Transient (Short-term)',
        non_transient: 'Non-Transient (Long-term)'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDate = (date: Date | null): string => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTotalDays = () => {
        if (moveInDate && moveOutDate) {
            const days = Math.ceil((moveOutDate.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24));
            return days;
        }
        return null;
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="EDIT APPLICATION"
            eyebrow={application?.accommodation?.accommodationName || "Edit Application"}
            maxWidth={600}
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !hasChanges()}
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-5">
                {/* Room Type - Only show available room types */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {availableRoomTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setRoomType(type)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                                    roomType === type
                                        ? 'bg-[#6B0F2B] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {roomTypeLabels[type] || type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stay Type - Only show available stay types */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stay Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {availableStayTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setStayType(type)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    stayType === type
                                        ? 'bg-[#6B0F2B] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {stayTypeLabels[type] || type}
                            </button>
                        ))}
                    </div>
                    {availableStayTypes.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">No stay types available for this accommodation</p>
                    )}
                </div>

                {/* Date Range for Transient - Custom Calendar */}
                {stayType === 'transient' && (
                    <div className="bg-[#F9F5F6] rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Stay Dates <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Move-in Date */}
                            <div className="relative" ref={moveInCalendarRef}>
                                <button
                                    onClick={() => {
                                        setShowMoveInCalendar(!showMoveInCalendar);
                                        setShowMoveOutCalendar(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 text-sm"
                                >
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Move-in</div>
                                    <div className="font-medium text-gray-800">{formatDate(moveInDate)}</div>
                                </button>
                                {showMoveInCalendar && (
                                    <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[280px]">
                                        <SimpleCalendar
                                            selectedDate={moveInDate}
                                            onSelect={(date) => {
                                                setMoveInDate(date);
                                                setShowMoveInCalendar(false);
                                            }}
                                            minDate={today}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Move-out Date */}
                            <div className="relative" ref={moveOutCalendarRef}>
                                <button
                                    onClick={() => {
                                        setShowMoveOutCalendar(!showMoveOutCalendar);
                                        setShowMoveInCalendar(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 text-sm"
                                >
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Move-out</div>
                                    <div className="font-medium text-gray-800">{formatDate(moveOutDate)}</div>
                                </button>
                                {showMoveOutCalendar && (
                                    <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[280px]">
                                        <SimpleCalendar
                                            selectedDate={moveOutDate}
                                            onSelect={(date) => {
                                                setMoveOutDate(date);
                                                setShowMoveOutCalendar(false);
                                            }}
                                            minDate={moveInDate || today}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {moveInDate && moveOutDate && (
                            <div className="mt-3 p-2 bg-white rounded-lg text-center">
                                <p className="text-[12px] text-[#6B4050]">
                                    <span className="font-semibold">{getTotalDays()} days</span> total stay
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Duration for Non-Transient */}
                {stayType === 'non_transient' && (
                    <div className="bg-[#F9F5F6] rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Duration of Stay
                        </label>
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-gray-600">
                                Based on your {application?.contractMonths || 6}-month contract
                            </p>
                        </div>
                    </div>
                )}

                {/* Preferred Tags/Amenities */}
                {availableTags.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preferred Amenities
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        selectedTags.includes(tag)
                                            ? 'bg-[#C9973A] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Select amenities you prefer (optional)
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                        You can only edit applications that are still <strong>pending</strong>. 
                        Once reviewed, applications cannot be modified.
                    </p>
                </div>
            </div>
        </Modal>
    );
}