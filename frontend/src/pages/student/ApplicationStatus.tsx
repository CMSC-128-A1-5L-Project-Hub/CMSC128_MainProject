import { useState, useMemo, useRef } from 'react'
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';

function timeAgo(dateStr: string) {
    if (dateStr === '-') return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
}

export default function ApplicationStatus() {
    const statusStyles: Record<string, { bg: string; dot: string ; text: string}> = {
        approved:      { bg: '#1A7A4A', dot: '#1A7A4A' , text: '#1A7A4A'},
        pending:       { bg: '#C9973A', dot: '#C9973A' , text: '#C9973A'},
        'under review':{ bg: '#6B3AB7', dot: '#6B3AB7' , text: '#6B3AB7'},
        rejected:      { bg: '#6B0F2B', dot: '#9E2040' , text: '#9E2040'},
        waitlisted:    { bg: '#3A6AB7', dot: '#3A6AB7' , text: '#3A6AB7'},
    }

    const rowStyles: Record<string, { bg: string; text: string}> = {
        approved:      { bg: '#1A7A4A', text: '#000000'},
        pending:       { bg: '#FFFFFF', text: '#000000'},
        'under review':{ bg: '#6B3AB7', text: '#000000'},
        rejected:      { bg: '#6B0F2B', text: '#9A7080'},
        waitlisted:    { bg: '#EFF4FF', text: '#000000'},
    }

    const applications = [
        { dormitory: 'Kamia Residence Hall', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'Molave Residence Hall', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'Narra Residence Hall', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'Yakai Boarding House', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'Ilang Residence Hall', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'Malvar Residence Hall', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'wawawa', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'wawawa', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'wawawa', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'wawawa', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'Kamia Residence Hall', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'Molave Residence Hall', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'Narra Residence Hall', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'Yakai Boarding House', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'Ilang Residence Hall', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'Malvar Residence Hall', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'wawawa', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'wawawa', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'wawawa', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'wawawa', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'Kamia Residence Hall', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'Molave Residence Hall', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'Narra Residence Hall', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'Yakai Boarding House', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'Ilang Residence Hall', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'Malvar Residence Hall', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'wawawa', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'wawawa', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'wawawa', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'wawawa', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'Kamia Residence Hall', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'Molave Residence Hall', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'Narra Residence Hall', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'Yakai Boarding House', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'Ilang Residence Hall', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'Malvar Residence Hall', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
        { dormitory: 'wawawa', type: 'Studio', location: 'On-campus', dateApplied: 'Mar 12, 2026', reviewedOn: 'Mar 14, 2026', reviewedBy: 'Manager Ana Lyn', status: 'approved', remarks: 'Good' },
        { dormitory: 'wawawa', type: 'Apartment', location: 'Off-campus', dateApplied: 'Mar 14, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'On campus', dateApplied: 'Mar 15, 2026', reviewedOn: 'Mar 16, 2026', reviewedBy: '-',status: 'under review', remarks: '-' },
        { dormitory: 'wawawa', type: 'Boarding', location: 'Off-campus', dateApplied: 'Mar 16, 2026', reviewedOn: '-', reviewedBy: '-',status: 'waitlisted', remarks: 'Incomplete docs' },
        { dormitory: 'wawawa', type: 'Studio', location: 'Off-campus', dateApplied: 'Mar 10, 2026', reviewedOn: 'Mar 11, 2026', reviewedBy: '-',status: 'rejected', remarks: '-' },
        { dormitory: 'wawawa', type: 'Shared', location: 'Partnered House', dateApplied: 'Mar 18, 2026', reviewedOn: '-', reviewedBy: 'Not yet reviewed', status: 'pending', remarks: 'No vacancy' },
    ]

    const [sortBy, setSortBy] = useState("Date applied (Asc.)");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const sortedApplications = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return [...applications]
            .filter(a => !q || [a.dormitory, a.type, a.location, a.status, a.remarks, a.reviewedBy]
                .some(field => field.toLowerCase().includes(q))
            )
            .sort((a, b) => {
                const parseDate = (str: string) => str === '-' ? 0 : new Date(str).getTime();

                if (sortBy === "Date applied (Asc.)")  return parseDate(a.dateApplied) - parseDate(b.dateApplied);
                if (sortBy === "Date applied (Desc.)") return parseDate(b.dateApplied) - parseDate(a.dateApplied);
                if (sortBy === "Reviewed on (Asc.)")   return parseDate(a.reviewedOn)  - parseDate(b.reviewedOn);
                if (sortBy === "Reviewed on (Desc.)")  return parseDate(b.reviewedOn)  - parseDate(a.reviewedOn);
                if (sortBy === "Status") return a.status.localeCompare(b.status);
                return 0;

            });
        }, [sortBy, searchQuery]);

    const counts = {
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        pending: applications.filter(a => a.status === 'pending').length,
        waitlisted: applications.filter(a => a.status === 'waitlisted').length,
        underReview: applications.filter(a => a.status === 'under review').length,
    }     

    const stats = [
        { label: 'approved', count: counts.approved, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
        { label: 'pending', count: counts.pending, from: '#C9973A', to: '#E8C37A', bg: '#FDF6EC', text: '#C9973A' },
        { label: 'under review', count: counts.underReview, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
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
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-col">
            <div className='flex flex-row justify-start items-center mt-3'>
                <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div> 
                <h1 className='font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] px-5 lg:p-0'>Application Dashboard</h1>
            </div>
            <hr className="border-t-1 border-[#6B0F2B] border-opacity-10 my-1" />
            
            <div className="bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 mx-4 mt-4 mb-2 rounded-xl shrink-0">
                <p className="uppercase text-[#C9973A] text-[12px] lg:text-[13px]">Good day, Ana Reyes</p>
                <h1 className="font-bold text-[20.22px] lg:text-[21.22px] text-white">Check your application status</h1>
                <p className="text-white text-opacity-55 text-[12.5px] lg:text-[13.5px]">We make it easy for you to track the accommodations you've applied for</p>
            </div>

            <div className="bg-white p-4 mx-4 mt-2 mb-4 rounded-xl shrink-0">             
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, i) => (
                        <div key={stat.label} className={i===0 ? "col-span-2 lg:col-span-1" : "col-span-1"}>
                            <span className="block uppercase font-bold text-[11px] lg:text-[12px]" style={{ color: stat.text }}>
                                {stat.label}
                            </span>
                            <div className="flex flex-grow items-center gap-3 mt-1">
                                <div className="flex-1 rounded-xl h-5 lg:h-7" style={{ backgroundColor: stat.bg }}>
                                    <div
                                        className="lg:h-7 h-5 rounded-xl flex items-center justify-left pl-2"
                                        style={{
                                            width: `${applications.length === 0 ? 0 : (stat.count / trueTotal) * 100}%`,
                                            background: `linear-gradient(to right, ${stat.from}, ${stat.to})`
                                        }}
                                    >
                                        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-white text-[11px] lg:text-[12px] font-bold">{stat.count}/{trueTotal}</span>
                                    </div>
                                </div>
                                <span className="text-[12px] lg:text-[13px] font-bold" style={{ color: stat.text }}>
                                    {applications.length === 0 ? 0 : Math.round((stat.count / trueTotal) * 100)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white mx-4 my-0 rounded-xl p-4 flex flex-col min-h-0" style={{ height: 'calc(100vh - 2rem)' }}>
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
                                { label: "Reviewed on (Asc.)", href: "" },
                                { label: "Reviewed on (Desc.)", href: "" },
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
                        <div className="hidden lg:flex items-center gap-2 ">
                            <div className={`px-1 flex items-center border-2 lg:border-3 bg-[#FAF4F6] border-[#6B0F2B] border-opacity-10 h-12 rounded-[8.8px] overflow-hidden transition-all duration-300 ${searchOpen ? 'w-44' : 'w-12'}`}>
                                <button 
                                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) inputRef.current?.focus(); }}
                                    className="p-1 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" fill="#FAF4F6" viewBox="0 0 24 24">
                                        <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                                    </svg>
                                </button>
                                    <input  
                                        type="text"
                                        placeholder="Search..."
                                        ref={inputRef}
                                        value={searchQuery}
                                        onBlur={() => { setSearchOpen(false); setSearchQuery(""); }}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className={`bg-[#FAF4F6] text-[12px] lg:text-[13px] px-1 outline-none transition-all duration-300 ${searchOpen ? 'w-full opacity-100' : 'w-0 opacity-0'} w-full`}
                                    />
                            </div>
                        </div>

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
                    {applications.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="uppercase text-[14px] text-[#9A7080] font-bold">
                                No applications found
                            </p>
                        </div>
                    )}
                    <table className= {` ${applications.length === 0 ? "hidden" : "table-fixed w-full border-separate border-spacing-0"} `}>
                        <thead className={`${applications.length === 0 ? "hidden" : 'sticky top-0 bg-[#F7F3F3] border-separate border-spacing-0'}`}>
                            <tr className="text-[#9A7080] text-[12px] lg:text-[14px] 6B0F2B">
                                <th className='uppercase p-2 text-left whitespace-nowrap w-40 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>dormitory</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>date applied</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>reviewed on</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>status</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>remarks</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-24 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((app, index) => (
                                <tr key={index}
                                style = {{ backgroundColor: (rowStyles[app.status]?.bg ?? '#888')  + '0D',
                                    color: (rowStyles[app.status]?.text ?? '#888'),
                                }}>
                                    <td className='px-2 py-2 border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>
                                        <span className="block text-[13px] lg:text-[15px] font-semibold">{app.dormitory}</span>
                                        <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">{app.type} • {app.location}</span>
                                    </td>
                                    <td className='px-2 py-2 whitespace-nowrap border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>
                                        <span className="block text-[12px] lg:text-[14px]">{app.dateApplied}</span>
                                        <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">{timeAgo(app.dateApplied)}</span>
                                    </td>
                                    <td className='px-2 py-2 whitespace-nowrap border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>
                                        <span className='block text-[12px] lg:text-[14px]'>{app.reviewedOn}</span>
                                        <span className='block text-[10px] lg:text-[12px] text-[#9A7080]'>{app.reviewedBy}</span>
                                    </td>
                                    <td className='text-[13px] capitalize border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4 font-bold'>
                                        <div className='bg-opacity-10 p-2 w-fit rounded-[50px] flex flex-row'
                                            style = {{ backgroundColor: (statusStyles[app.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                        >
                                            <div className='p-1.5 w-1.5 h-1.5 ml-1 mr-1.5 mt-1 lg:mt-1 rounded-[100px]'
                                                style = {{ backgroundColor: statusStyles[app.status]?.dot ?? '#888' }}
                                            />
                                            <p className='mr-1'
                                            style = {{ color: statusStyles[app.status]?.text ?? '#888',
                                                fontWeight: 'bold',
                                            }}>{app.status}</p>
                                        </div>
                                    </td>
                                    <td className='px-2 py-2 text-[12px] lg:text-[14px] truncate w-full border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>{app.remarks}</td>
                                    <td className='px-2 py-2 text-[12px] lg:text-[14px] border-[#6B0F2B] border-opacity-5 border-b-2 lg:border-b-4'>
                                        <button className="text-[#6B0F2B] font-semibold text-[12px] lg:text-[15px] border-2 lg:border-3 py-1 px-4 lg:py-1.5 lg:px-5 bg-[#F5ECF0] border-[#6B0F2B] border-opacity-5 rounded-[8.8px]">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
            {searchOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center lg:hidden">
                    <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                        <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                            </svg>
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
    )
}