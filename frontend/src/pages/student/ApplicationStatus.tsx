import { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import ApplicationTable from '../../components/ApplicationStatus/ApplicationTable';
import HeroBanner from '../../components/dashboard/HeroBanner';
import StatsBanner from '../../components/ApplicationStatus/StatsBanner';
import SearchBar from '../../components/SearchBar';
import ApplicationStatusModal from "../../components/ApplicationStatusModal";
import type { Application } from '../../components/ApplicationStatusModal';

interface HeroContent {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
}

export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "waitlisted" | "cancelled" | "confirmed";

// Fetch from the API
const fetchApplications = async (): Promise<Application[]> => {
    const res = await fetch("/api/applications/my-applications");
    if (!res.ok) throw new Error("Failed to fetch applications");
    const body = await res.json();
    return body.data ?? body;
};

// Main component
export default function ApplicationStatusPage() {
    const heroContent: HeroContent = {
        name: "Ana Reyes",
        greeting: "Good Day",
        title: "Check your application status",
        subtitle: "We make it easy for you to track the accommodations you've applied for",
    };

    const [sortBy, setSortBy] = useState("Date applied (Asc.)");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    // Data fetching
    // const { data: applications = [], isLoading, isError } = useQuery({
    //     queryKey: ["applications"],
    //     queryFn: fetchApplications,
    // });

    // const { data: applications = [], isLoading, isError } = useQuery({
//     queryKey: ["applications"],
//     queryFn: fetchApplications,
// });

    const applications: Application[] = [
        {
            id: 1,
            accommodationId: 1,
            studentNumber: "2022-00001",
            applicationRoomType: "single",
            applicationStayType: "non_transient",
            applicationStatus: "pending",
            durationOfStayDays: 120,
            applicationDate: "2026-02-10T00:00:00.000Z",
            rejectionReason: null,
            accommodation: {
                id: 1,
                accommodationName: "Kamia Residence Hall",
                accommodationLocation: "On-campus",
                accommodationType: "dormitory",
            },
        },
        {
            id: 2,
            accommodationId: 2,
            studentNumber: "2022-00001",
            applicationRoomType: "double",
            applicationStayType: "transient",
            applicationStatus: "under_review",
            durationOfStayDays: 60,
            applicationDate: "2026-02-15T00:00:00.000Z",
            rejectionReason: null,
            accommodation: {
                id: 2,
                accommodationName: "Molave Residence Hall",
                accommodationLocation: "Off-campus",
                accommodationType: "boarding_house",
            },
        },
        {
            id: 3,
            accommodationId: 3,
            studentNumber: "2022-00001",
            applicationRoomType: "shared",
            applicationStayType: "non_transient",
            applicationStatus: "approved",
            durationOfStayDays: 180,
            applicationDate: "2026-01-20T00:00:00.000Z",
            rejectionReason: null,
            accommodation: {
                id: 3,
                accommodationName: "Narra Residence Hall",
                accommodationLocation: "On-campus",
                accommodationType: "dormitory",
            },
        },
        {
            id: 4,
            accommodationId: 4,
            studentNumber: "2022-00001",
            applicationRoomType: "single",
            applicationStayType: "transient",
            applicationStatus: "rejected",
            durationOfStayDays: 30,
            applicationDate: "2026-02-01T00:00:00.000Z",
            rejectionReason: "Incomplete documents submitted.",
            accommodation: {
                id: 4,
                accommodationName: "Yakai Boarding House",
                accommodationLocation: "Off-campus",
                accommodationType: "boarding_house",
            },
        },
        {
            id: 5,
            accommodationId: 5,
            studentNumber: "2022-00001",
            applicationRoomType: "double",
            applicationStayType: "non_transient",
            applicationStatus: "waitlisted",
            durationOfStayDays: 90,
            applicationDate: "2026-02-20T00:00:00.000Z",
            rejectionReason: null,
            accommodation: {
                id: 5,
                accommodationName: "Ilang Residence Hall",
                accommodationLocation: "Off-campus",
                accommodationType: "dormitory",
            },
        },
    ];

    const isLoading = false;
    const isError = false;
    
    const sortedApplications = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return [...applications]
            .filter(a => !q || [
                a.accommodation?.accommodationName || '',
                a.accommodation?.accommodationLocation || '',
                a.accommodation?.accommodationType || '',
                a.applicationRoomType || '',
                a.applicationStayType || '',
                a.applicationStatus || '',
                a.rejectionReason || '',
            ].some(field => field.toLowerCase().includes(q)))
            .sort((a, b) => {
                if (sortBy === "Date applied (Asc.)") return new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
                if (sortBy === "Date applied (Desc.)") return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
                if (sortBy === "Status") return a.applicationStatus.localeCompare(b.applicationStatus);
                return 0;
            });
    }, [applications, sortBy, searchQuery]);

    const counts = {
        approved: applications.filter(a => a.applicationStatus === 'approved').length,
        rejected: applications.filter(a => a.applicationStatus === 'rejected').length,
        pending: applications.filter(a => a.applicationStatus === 'pending').length,
        waitlisted: applications.filter(a => a.applicationStatus === 'waitlisted').length,
        under_review: applications.filter(a => a.applicationStatus === 'under_review').length,
        cancelled: applications.filter(a => a.applicationStatus === 'cancelled').length,
    };

    const stats = [
        { label: 'approved', count: counts.approved, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
        { label: 'pending', count: counts.pending, from: '#C9973A', to: '#E8C37A', bg: '#FDF6EC', text: '#C9973A' },
        { label: 'under review', count: counts.under_review, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
        { label: 'rejected', count: counts.rejected, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
        { label: 'waitlisted', count: counts.waitlisted, from: '#3A6AB7', to: '#7cd3f2', bg: '#e4f0f5', text: '#3A6AB7' },
    ];

    const trueTotal = applications.length;
    const totalApps = sortedApplications.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedApplications.length / ROWS_PER_PAGE) || 1;
    
    // Pagination slice
    const paginated = sortedApplications.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    // Make it so long remarks will be cut at 50 chars
    const tableApplications = paginated.map(app => ({
        ...app,
        rejectionReason: app.rejectionReason && app.rejectionReason.length > 50 
            ? app.rejectionReason.slice(0, 50) + "..." 
            : app.rejectionReason
    }));

    return (
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-row">
            <hr className="fixed border-t-1 top-16 w-full border-t border-[#6B0F2B] border-opacity-10 my-1" />

            <Sidebar role='student' />

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className='flex flex-row justify-start items-center mt-3'>
                    <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div>
                    <h1 className='font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] pl-16 lg:p-0'>Application Dashboard</h1>
                </div>

                <div className='pt-6 px-4'>
                    <HeroBanner
                        greeting={heroContent.greeting}
                        name={heroContent.name}
                        title={heroContent.title}
                        subtitle={heroContent.subtitle}
                        type="mini"
                    />
                </div>

                <StatsBanner stats={stats} total={trueTotal} />

                <div className="bg-white mx-4 my-0 rounded-xl mb-4 p-6 flex flex-col min-h-0" style={{ height: 'calc(100vh - 2rem)' }}>
                    <div className='flex justify-between items-center pb-2 lg:pb-4'>
                        <div>
                            <h1 className='font-bold -mt-1'>Application History</h1>
                            <p className='italic text-[11px] lg:text-[12px]'>{totalApps} total applications</p>
                        </div>

                        <div className='flex flex-row gap-2'>
                            <Dropdown
                                title="No. of Items"
                                items={[
                                    { label: "5", href: "" },
                                    { label: "10", href: "" },
                                    { label: "15", href: "" },
                                    { label: "20", href: "" },
                                ]}
                                direction='down'
                                widthClass="w-29 lg:w-32"
                                titleClass="text-[10px] lg:text-[11px]"
                                selectedClass="text-[12px] lg:text-[13px]"
                                onSelect={(label) => { setRows(parseInt(label, 10)); setCurrentPage(1); }}
                            />
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
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onPageReset={() => setCurrentPage(1)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-auto flex-1 min-h-0 mt-1 rounded-t-lg">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-400 font-medium text-center animate-pulse">
                                    Loading your applications...
                                </p>
                            </div>
                        ) : isError ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-red-500 font-medium text-center">
                                    Failed to load applications. Please check your connection.
                                </p>
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-center">
                                <p className="text-gray-500 font-medium text-lg">No applications found.</p>
                                <p className="text-gray-400 text-sm mt-1">When you apply for an accommodation, it will appear here.</p>
                            </div>
                        ) : (
                            <ApplicationTable
                                applications={tableApplications}
                                onView={(app) => { 
                                    // Find the original app so the modal displays the full text
                                    const originalApp = applications.find(a => a.id === app.id) || app;
                                    setSelectedApp(originalApp); 
                                    setViewOpen(true); 
                                }}
                            />
                        )}
                    </div>
                    <hr className=" border-[#6B0F2B]/5 border-t-2" />

                    <div className='flex flex-nowrap justify-between'>
                        <div className='flex justify-start flex-col gap-2'>
                            <div className='flex flex-col items-start justify-start'>
                                <span className='text-[11px] lg:text-[13px] text-[#9A7080] p-0 mt-4 m-0'>
                                    Showing {totalApps === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, totalApps)} of {totalApps}
                                </span>
                            </div>
                            <button className='text-[#6B0F2B] -mt-1 p-0 text-[14px] flex flex-row items-center'>
                                View all
                                <svg
                                    className='w-4 h-4'
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#6B0F2B">
                                    </path>
                                    </g>
                                </svg>
                            </button>
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

                {/* Modal */}
                <ApplicationStatusModal
                    open={viewOpen}
                    onClose={() => { setViewOpen(false); setSelectedApp(null); }}
                    application={selectedApp}
                />
            </div>
        </div>
    )
}