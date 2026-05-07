import { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import ApplicationTable from '../../components/ApplicationStatus/ApplicationTable';
import HeroBanner from '../../components/dashboard/HeroBanner';
import CustomHeader from '../../components/CustomHeader';
import StatsBanner from '../../components/ApplicationStatus/StatsBanner';
import SearchBar from '../../components/SearchBar';
import ApplicationStatusModal, { type Application } from "../../components/ApplicationStatus/ApplicationStatusModal";

// define the status type locally
export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "waitlisted" | "cancelled" | "confirmed";

interface HeroContent {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
}

interface ApplicationStatusPageProps {
    userName?: string;
}


// Fetch from the API
const fetchApplications = async (): Promise<Application[]> => {
    try {
        const res = await fetch("/api/applications/my-applications");
        
        // if the server explicitly says "Not Found" (404), return an empty array
        if (res.status === 404) {
            return [];
        }

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        // check if the response is actually JSON before parsing
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            // if it's an HTML error page from the server, treat as empty or handle accordingly
            console.error("Received non-JSON response");
            return [];
        }

        const body = await res.json();
        return body.data ?? body;
    } catch (error) {
        console.error("Fetch applications error:", error);
        throw error; // let react query catch this to trigger isError
    }
};

// Main component
export default function ApplicationStatusPage({ userName = "Student" }: ApplicationStatusPageProps) {
    const heroContent: HeroContent = {
        name: userName,
        greeting: "Good Day",
        title: "Check your application status",
        subtitle: "We make it easy for you to track the accommodations you've applied for",
    };

    const [sortBy, setSortBy] = useState("Date applied (Asc.)");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    // Data fetching - using the real API
    const { data: applications = [], isLoading, isError } = useQuery({
        queryKey: ["applications"],
        queryFn: fetchApplications,
    });

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

    // const stats = [
    //     { label: 'approved', count: counts.approved, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
    //     { label: 'pending', count: counts.pending, from: '#C9973A', to: '#E8C37A', bg: '#FDF6EC', text: '#C9973A' },
    //     { label: 'under review', count: counts.under_review, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
    //     { label: 'rejected', count: counts.rejected, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
    //     { label: 'waitlisted', count: counts.waitlisted, from: '#3A6AB7', to: '#7cd3f2', bg: '#e4f0f5', text: '#3A6AB7' },
    // ];

    const stats = [
        { label: 'approved', count: counts.approved, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },

        { label: 'pending', count: counts.pending, from: '#C9973A', to: '#E8C37A', bg: '#FEF8EE', text: '#C9973A' },

        { label: 'waitlisted', count: counts.waitlisted, from: '#3A6AB7', to: '#7cd3f2', bg: '#F4F0FA', text: '#3A6AB7' },

        { label: 'under review', count: counts.under_review, from: '#6B3AB7', to: '#9B6AE7', bg: '#F0F7F3', text: '#6B3AB7' },

        { label: 'cancelled', count: counts.cancelled, from: '#AA2661', to: '#FDCAE0', bg: '#FAF0F7', text: '#AE2F67' },

        { label: 'rejected', count: counts.rejected, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
    ];

    const trueTotal = applications.length;
    const totalApps = sortedApplications.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedApplications.length / ROWS_PER_PAGE) || 1;
    
    // Pagination slice
    const paginated = sortedApplications.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    // Truncate long rejection reasons for table display
    const tableApplications = paginated.map(app => ({
        ...app,
        rejectionReason: app.rejectionReason && app.rejectionReason.length > 50 
            ? app.rejectionReason.slice(0, 50) + "..." 
            : app.rejectionReason
    }));

    return (
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-row">
            <Sidebar role='student' />
            <div className = "flex flex-col overflow-hidden w-full">
                <CustomHeader
                    title="Applications"></CustomHeader>
                <div className="flex-1 flex flex-col overflow-hidden gap-4 lg:gap-6 p-4 lg:p-6">
                    <div>
                        <HeroBanner
                            greeting={heroContent.greeting}
                            name={heroContent.name}
                            title={heroContent.title}
                            subtitle={heroContent.subtitle}
                            type="mini"
                        />
                    </div>
                    

                    <StatsBanner stats={stats} total={trueTotal} cols={6}/>

                    <div className="bg-white rounded-2xl p-6 flex flex-col min-h-0" style={{ height: 'calc(100vh - 2rem)' }}>
                        <div className='flex justify-between pb-2 lg:pb-4'>
                            <div>
                                <h1 className='font-bold -mt-1'>Application History</h1>
                                <p className='italic text-[11px] lg:text-[12px]'>{totalApps} total applications</p>
                            </div>

                            <div className='flex flex-row gap-2'>
                                <div className='hidden lg:block'>
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
                                </div>
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
                                
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onPageReset={() => setCurrentPage(1)}
                                />
                                
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
                                    <p className="text-[#9A7080] font-medium text-lg">No applications found</p>
                                    <p className="text-[#9A7080]/60 text-sm mt-1">When you apply for an accommodation, it will appear here</p>
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

                        <div className={`${applications.length === 0 ? "hidden" : "flex"} flex-col`}>
                            <hr className=" border-[#6B0F2B]/5 border-t-2" />
                            <div className='flex flex-nowrap justify-between'>
                                <div className='flex justify-start flex-col gap-2'>
                                    <div className='flex flex-col items-start justify-start'>
                                        <span className='text-[11px] lg:text-[13px] text-[#9A7080] p-0 mt-4 m-0'>
                                            Showing {totalApps === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, totalApps)} of {totalApps}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center m-2 mt-4 lg:mt-6 text-sm text-[#9A7080]">
                                    <div className={applications.length > 0 ? 'flex gap-2 text-[12px] lg:text-[15px]' : 'hidden'}>
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
                        
                    </div>

                    {/* Modal */}
                    <ApplicationStatusModal
                        open={viewOpen}
                        onClose={() => { setViewOpen(false); setSelectedApp(null); }}
                        application={selectedApp}
                    />
                </div>
            
            </div>
            
        </div>
    )
}