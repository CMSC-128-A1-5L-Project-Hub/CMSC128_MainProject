import { useState, useMemo, useRef } from 'react'
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import sampleDorm from '../../assets/images/sample_dorm.jpg';
import ApplicationTable from '../../components/ApplicationStatus/ApplicationTable';
import HeroBanner from '../../components/dashboard/HeroBanner';
import StatsBanner from '../../components/ApplicationStatus/StatsBanner';
import SearchBar from '../../components/SearchBar';

interface HeroContent {
    greeting: string
    name: string
    title: string
    subtitle: string
}

export interface Application {
  id: number;
  accommodation_id: number;
  student_number: string;
  application_date: Date;
  room_type: 'single' | 'double' | 'shared';
  stay_type: 'transient' | 'non_transient';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review';
  duration_of_stay_days: number;
  rejection_reason: string | null;

  // from JOIN with accommodations — kept for display
  dormitory: string;
  location: string;
  address: string;
  rent: number;
  image: string;
}

function timeAgo(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
}

function randomDateObj(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const dormitories = [
        { name: 'Kamia Residence Hall', location: 'On-campus' },
        { name: 'Molave Residence Hall', location: 'Off-campus' },
        { name: 'Narra Residence Hall', location: 'On-campus' },
        { name: 'Yakai Boarding House', location: 'Off-campus' },
        { name: 'Ilang Residence Hall', location: 'Off-campus' },
        { name: 'Malvar Residence Hall', location: 'Partnered House' },
    ];

    const rents = [2000, 3000, 4000, 5000, 6000, 7000]
    const statuses = ['approved', 'pending', 'under_review', 'waitlisted', 'rejected'] as const;

    function randomFrom<T>(arr: readonly T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const applications: Application[] = Array.from({ length: 48 }, (_, i) => {
        const dorm = dormitories[i % dormitories.length];
        const status = randomFrom(statuses);

        return {
            id: i + 1,
            accommodation_id: (i % 6) + 1,
            student_number: "2022-00001",
            application_date: randomDateObj(new Date(2026, 1, 1), new Date(2026, 2, 18)),
            room_type: randomFrom(['single', 'double', 'shared'] as const),
            stay_type: randomFrom(['transient', 'non_transient'] as const),
            status,
            duration_of_stay_days: Math.floor(30 + Math.random() * 150),
            rejection_reason: status === 'rejected' ? 'Incomplete documents submitted.' : null,

            // from accommodations JOIN
            dormitory: dorm.name,
            location: dorm.location,
            address: `L${i+1} B${i+2} Sample St., Bgy. Batong Malake, Los Baños`,
            rent: randomFrom(rents),
            image: sampleDorm,
        };
    });

export default function ApplicationStatus() {
    const semesterStart = new Date("2026-01-19");
    const semesterEnd = new Date("2026-04-29");
    const semCount = 2;
    const heroContent: HeroContent = {
        name: "Ana Reyes",
        greeting: "Good Day",
        title: "Manage your billing and payments",
        subtitle: "Stay on top of your balances, track transactions, and view your payment history with ease",
    }
    
    const currentAY = semCount === 2
        ? `AY ${semesterEnd.getFullYear() - 1}-${semesterEnd.getFullYear()}`
        : `AY ${semesterEnd.getFullYear()}-${semesterEnd.getFullYear() + 1}`;
    
    const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
        approved:     { bg: '#1A7A4A', dot: '#1A7A4A', text: '#1A7A4A' },
        pending:      { bg: '#C9973A', dot: '#C9973A', text: '#C9973A' },
        under_review: { bg: '#6B3AB7', dot: '#6B3AB7', text: '#6B3AB7' },
        rejected:     { bg: '#6B0F2B', dot: '#9E2040', text: '#9E2040' },
        waitlisted:   { bg: '#3A6AB7', dot: '#3A6AB7', text: '#3A6AB7' },
        cancelled:    { bg: '#888888', dot: '#888888', text: '#888888' },
    }

    const [sortBy, setSortBy] = useState("Date applied (Asc.)");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [typedCancel, setTypedCancel] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<typeof applications[0] | null>(null);

    const sortedApplications = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return [...applications]
            .filter(a => !q || [
                a.dormitory,
                a.location,
                a.room_type,
                a.stay_type,
                a.status,
                a.rejection_reason ?? '',
            ].some(field => field.toLowerCase().includes(q)))
            .sort((a, b) => {
                const parseDate = (str: string) => str === '-' ? 0 : new Date(str).getTime();

                if (sortBy === "Date applied (Asc.)")  return a.application_date.getTime() - b.application_date.getTime();
                if (sortBy === "Date applied (Desc.)") return b.application_date.getTime() - a.application_date.getTime();
                if (sortBy === "Status") return a.status.localeCompare(b.status);
                return 0;

            });
        }, [sortBy, searchQuery]);

    const counts = {
        approved:    applications.filter(a => a.status === 'approved').length,
        rejected:    applications.filter(a => a.status === 'rejected').length,
        pending:     applications.filter(a => a.status === 'pending').length,
        waitlisted:  applications.filter(a => a.status === 'waitlisted').length,
        under_review: applications.filter(a => a.status === 'under_review').length,
        cancelled:   applications.filter(a => a.status === 'cancelled').length,
    }    

    const stats = [
        { label: 'approved', count: counts.approved, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
        { label: 'pending', count: counts.pending, from: '#C9973A', to: '#E8C37A', bg: '#FDF6EC', text: '#C9973A' },
        { label: 'under review', count: counts.under_review, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
        { label: 'rejected', count: counts.rejected, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
        { label: 'waitlisted', count: counts.waitlisted, from: '#3A6AB7', to: '#7cd3f2', bg: '#e4f0f5', text: '#3A6AB7' },
    ]

    const trueTotal = applications.length;
    const totalApps = sortedApplications.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedApplications.length / ROWS_PER_PAGE);
    const inputRef = useRef<HTMLInputElement>(null);
    const paginated = sortedApplications.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    return (
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-row">
            <hr className="fixed border-t-1 top-16 w-full border-t border-[#6B0F2B] border-opacity-10 my-1" />
            
            <Sidebar 
                role='student'
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className='flex flex-row justify-start items-center mt-3'>
                    <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div> 
                    <h1 className='font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] pl-16 lg:p-0'>Application Dashboard</h1>
                </div>
                
                <div className='pt-7 px-4'>
                    <HeroBanner
                        greeting={heroContent.greeting}
                        name={heroContent.name}
                        title={heroContent.title}
                        subtitle={heroContent.subtitle}
                        type="mini"
                    />
                </div>

                <StatsBanner
                    stats = {stats}
                    total = {trueTotal}>
                </StatsBanner>

                <div className="bg-white mx-4 my-0 rounded-xl mb-4 p-4 flex flex-col min-h-0" style={{ height: 'calc(100vh - 2rem)' }}>
                    <div className='flex justify-between items-center pb-2 lg:pb-4'>
                        <div className=''>
                            <h1 className='font-bold -mt-1'>Application History</h1>
                            <p className='italic text-[11px] lg:text-[12px]'>{totalApps} total applications</p>
                        </div>

                        <div className='flex flex-row gap-2'>
                            <Dropdown 
                                title="Sort by"
                                items={[
                                    { label: "Date applied (Asc.)", href: "" },
                                    { label: "Date applied (Desc.)", href: "" },
                                    { label: "Status", href: "" },
                                ]}
                                direction="down"
                                widthClass="w-32 lg:w-44"
                                titleClass="text-[10px] lg:text-[11px]"
                                selectedClass="text-[12px] lg:text-[13px]"
                                onSelect={(label) => { setSortBy(label); setCurrentPage(1); }}
                            />

                            <div className="flex items-center gap-2 lg:gap-3">
                            {/* Desktop: expanding search bar */}
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onPageReset={() => setCurrentPage(1)}>
                            </SearchBar>

                            {/* Mobile: icon that opens modal */}
                            <button className="lg:hidden border-2 p-1 px-2 bg-[#FAF4F6] border-[#6B0F2B] border-opacity-10 rounded-[8.8px] overflow-hidden" onClick={() => setSearchOpen(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" fill="none" viewBox="0 0 24 24">
                                    <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                                </svg>
                            </button>
                        </div>
                            
                        </div>
                    </div>

                    <div className="overflow-auto flex-1 min-h-0 mt-1 rounded-t-lg">
                        <ApplicationTable
                            applications = {paginated}
                            onView={(app) => {setSelectedApp(app); setViewOpen(true);}}>
                        </ApplicationTable>
                    </div>

                    <div className='flex flex-nowrap justify-between'>
                        <div className='flex justify-start items-center gap-2'>
                            <div className='m-1 mt-3 lg:mt-4'>                       
                                <Dropdown 
                                    title="No. of Items"
                                    items={[
                                        { label: "5", href: "" },
                                        { label: "10", href: "" },
                                        { label: "15", href: "" },
                                        { label: "20", href: "" },
                                    ]}
                                    direction='up'
                                    widthClass="w-29 lg:w-32"
                                    titleClass="text-[10px] lg:text-[12px]"
                                    selectedClass="text-[12px] lg:text-[14px]"
                                    onSelect={(label) => {setRows(parseInt(label, 10)); setCurrentPage(1)}}
                                />
                                
                            </div>
                            <span className='text-[11px] lg:text-[13px] text-[#9A7080] p-0 mt-2 m-0'>Showing {(currentPage-1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, totalApps)} of {totalApps}</span>
                        </div>
                        
                        <div className="flex justify-between items-center m-2 mt-4 lg:mt-6 text-sm text-[#9A7080]">     
                            <div className="flex gap-2 text-[12px] lg:text-[15px]">
                                <Pagination
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    buttonSize='w-6 h-6 p-0 lg:w-8 lg:h-8'
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {viewOpen && selectedApp && (                    
                    () => {
                        const isApproved = selectedApp.status === 'approved';
                        const isWaitlisted = selectedApp.status === 'waitlisted';
                        const isFinal = isApproved || isWaitlisted;
                        const step3Style = isApproved
                            ? statusStyles['approved']
                            : isWaitlisted
                            ? statusStyles['waitlisted']
                            : null;

                        return (
                            <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Application Status" maxWidth="clamp(360px, 50vw, 600px)">
                                <div className='flex flex-col'>
                                    {/*pede pa palitan to para scrollable siya, di ko lang alam pano format ng data kaya ganto muna*/}
                                    <img src={selectedApp.image} alt="" className='h-28 w-full mb-3 rounded-xl object-cover' />
                                    
                                    <div className='flex flex-row p-0 justify-between'>
                                        <div className='flex flex-col w-52'>
                                            <p className="text-[14px] font-bold">{selectedApp.dormitory}</p>
                                            <p className='text-[11px] pr-2'>{selectedApp.address}</p>
                                            <p className="text-[11px] text-[#9A7080]">{selectedApp.room_type} • {selectedApp.location}</p>
                                        </div>
                                        <div className='flex flex-col center-self'>
                                            <p className='text-[#9A7080] uppercase font-bold text-[12px]'>monthly rate</p>
                                            <p className='font-bold text-[#C9973A] -mt-1 text-[18px]'>₱{selectedApp.rent.toLocaleString()}</p>
                                            <p className='text-[#9A7080] text-[12px] -mt-1'>per month</p>
                                        </div>
                                    </div>
                                    <div className='mt-3 flex flex-row justify-between'>
                                        {/* Step 1: always green, always Submitted */}
                                        <div className='flex flex-col items-center text-center justify-center'>
                                            <div className='rounded-full w-10 h-10 bg-[#1A7A4A] flex items-center justify-center'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <p className='text-[#1A7A4A] text-[11px] font-bold'>Submitted</p>
                                            <p className='text-[#9A7080] text-[9px] -mt-1'>
                                                {selectedApp.application_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Step 2: shows actual status, turns green when approved/waitlisted */}
                                        <div className='flex flex-col items-center text-center justify-center'>
                                            <div className='rounded-full w-10 h-10 flex items-center justify-center'
                                                style={{ backgroundColor: isFinal ? '#1A7A4A' : statusStyles[selectedApp.status]?.bg ?? '#ccc' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <p className='text-[11px] capitalize font-bold'
                                                style={{ color: isFinal ? '#1A7A4A' : statusStyles[selectedApp.status]?.text ?? '#ccc' }}>
                                                {selectedApp.status.replace('_', ' ')}
                                            </p>
                                            <p className='text-[#9A7080] text-[9px] -mt-1'>-</p>
                                        </div>

                                        {/* Step 3: only active when approved or waitlisted */}
                                        <div className='flex flex-col items-center text-center justify-center'>
                                            <div className='rounded-full w-10 h-10 flex items-center justify-center'
                                                style={{ backgroundColor: step3Style?.bg ?? '#e5e7eb' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <p className='text-[11px] capitalize font-bold'
                                                style={{ color: step3Style?.text ?? '#9ca3af' }}>
                                                {isApproved ? 'Approved' : isWaitlisted ? 'Waitlisted' : 'Pending'}
                                            </p>
                                            <p className='text-[#9A7080] text-[9px] -mt-1'>
                                                -
                                            </p>
                                        </div>
                                    </div>
                                    <p className='uppercase pt-3 pb-1 font-bold text-[12px] text-[#9A7080]'>application information</p>
                                    <div className='w-full grid grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2'>
                                        <div className='flex flex-col'>
                                            <p className='uppercase font-bold text-[11px] text-[#6B4050]'>application id</p>
                                            <p className='font-bold truncate text-[11px]'>{selectedApp.id}</p>
                                        </div>
                                        <div className='flex flex-col'>
                                            <p className='uppercase font-bold text-[11px] text-[#6B4050]'>semester</p>
                                            {/* mali ata logic ng pagcompute nito */} 
                                            <p className='font-bold truncate text-[11px]'>Semester {semCount}, {currentAY}</p>
                                        </div>
                                        <div className='flex flex-col'>
                                            <p className='uppercase font-bold text-[11px] text-[#6B4050]'>current status</p>
                                            <div className='capitalize truncate bg-opacity-10 p-1 w-fit rounded-[50px] flex text-[11px] flex-row'
                                                style = {{ backgroundColor: (statusStyles[selectedApp.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                            >
                                                <div className='p-1 w-1 h-1 ml-1 mr-1.5 mt-1 lg:mt-1 rounded-[100px]'
                                                    style = {{ backgroundColor: statusStyles[selectedApp.status]?.dot ?? '#888' }}
                                                />
                                                <p className='mr-1'
                                                style = {{ color: statusStyles[selectedApp.status]?.text ?? '#888',
                                                    fontWeight: 'bold',
                                                }}>{selectedApp.status}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col'>
                                            <p className='uppercase font-bold text-[11px] text-[#6B4050]'>date applied</p>
                                            <p className='font-bold text-[11px]'>
                                                {selectedApp.application_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className='text-[#9A7080] text-[9px]'>{timeAgo(selectedApp.application_date)}</p>
                                        </div>    
                                    </div>
                                    <p className='uppercase pt-3 pb-1 font-bold text-[12px] text-[#9A7080]'>landlord remarks</p>
                                    <div className='w-full h-30 text-[11px] border-2 border-[#6B0F2B] border-opacity-5 rounded-xl p-2 text-[#9A7080] bg-[#FAF4F6]'>{selectedApp.rejection_reason ?? "No remarks by admin"}</div>
                                    
                                    <div className='flex flex-row gap-1 justify-end mt-2'>
                                        <p className='hidden text-[9px] border-2 border-[#6B0F2B] border-opacity-5 rounded-xl p-2 text-[#9A7080] bg-[#FAF4F6]'>By typing “CANCEL”, you are sure to cancel your application to this accommodation</p>
                                        <button className={`${selectedApp.status !== "approved" ? "hidden" : ""} text-[13px] py-0 px-4 h-10 font-bold text-white rounded-[100px] bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] border-0`}>Accept</button>
                                        <button 
                                            onClick={() => setCancelOpen(true)}
                                            className='text-[13px] font-bold text-white rounded-[100px] bg-gradient-to-br from-[#F3C9D9] to-[#3D2E2E] border-0'>Cancel</button>
                                    </div>

                                </div>
                            </Modal>
                        );
                    })()
                }
                {cancelOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-[10000] flex items-center justify-center">
                        <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                            <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                    <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                                </svg>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder=""
                                    value={typed}
                                    onChange={(e) => { setTyped(e.target.value); }}
                                    className="text-[12px] py-2 outline-none w-full"
                                />
                            </div>
                            <button onClick={() => {
                                const isCancel = typed.toLowerCase() === "cancel";
                                setTypedCancel(isCancel);
                                if (isCancel) {
                                    setConfirmCancel(true);
                                    setCancelOpen(false);
                                }}} 
                                className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                                Confirm
                            </button>
                            <button onClick={() => {setCancelOpen(false);}} className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                                Cancel
                            </button>
                        </div>
                    </div>
                )
                }
                {confirmCancel && !cancelOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-[11000] flex items-center justify-center">
                        <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                            <p>You have successfully cancelled your application</p>
                            <button onClick={() => {setConfirmCancel(false); setCancelOpen(false);  setViewOpen(false);}} className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                                Close
                            </button>
                        </div>
                    </div>
                )}
                {searchOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center lg:hidden">
                        <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                            <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search dormitory, status, type..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="text-[12px] py-2 outline-none w-full"
                                />
                            </div>
                            <button onClick={() => setSearchOpen(false)} className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
            

        </div>
    )
}