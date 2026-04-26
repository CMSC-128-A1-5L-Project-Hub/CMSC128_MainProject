import { useState, useMemo} from 'react'
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import sampleDorm from '../../assets/images/sample_dorm.jpg';
import ApplicationTable from '../../components/ApplicationStatus/ApplicationTable';
import HeroBanner from '../../components/dashboard/HeroBanner';
import StatsBanner from '../../components/ApplicationStatus/StatsBanner';
import SearchBar from '../../components/SearchBar';
import ApplicationModal from '../../components/ApplicationStatus/ApplicationModal';

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
    const heroContent: HeroContent = {
        name: "Ana Reyes",
        greeting: "Good Day",
        title: "Manage your billing and payments",
        subtitle: "Stay on top of your balances, track transactions, and view your payment history with ease",
    }

    const [sortBy, setSortBy] = useState("Date applied (Asc.)");
    const [searchQuery, setSearchQuery] = useState("");
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

                <div className="bg-white mx-4 my-0 rounded-xl mb-4 p-6 flex flex-col min-h-0" style={{ height: 'calc(100vh - 2rem)' }}>
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
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onPageReset={() => setCurrentPage(1)}>
                                </SearchBar>  
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
                    <ApplicationModal
                        application={selectedApp}
                        onClose={() => { setViewOpen(false); setSelectedApp(null); }}
                        onSubmit={() => { setViewOpen(false); setSelectedApp(null); }}
                    />
                )}
            </div>
            

        </div>
    )
}