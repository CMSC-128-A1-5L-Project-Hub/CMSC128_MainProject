import { useState } from 'react'
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
    const totalApps = 6;
    const stats = [
        { label: 'approved', count: 1, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
        { label: 'pending', count: 2, from: '#C9973A', to: '#E8C37A', bg: '#FDF6EC', text: '#C9973A' },
        { label: 'under review', count: 1, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
        { label: 'rejected', count: 2, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
    ]

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
    ]

    const ROWS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(applications.length / ROWS_PER_PAGE);
    const paginated = applications.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    return (
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-col">
            <h1 className='font-serif font-bold italic text-[30px] mx-4 my-1 text-[#6B0F2B]'>Application Status</h1>
            <hr className="border-t-1 border-[#6B0F2B] border-opacity-10 my-1" />
            
            <div className="bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 sm:p-6 mx-4 mt-4 mb-2 rounded-xl shrink-0">
                <p className="uppercase text-[#C9973A] text-[12px] lg:text-[16px]">Good day, Ana Reyes</p>
                <h1 className="font-bold text-[20.22px] lg:text-[28px] text-white">Check your application status</h1>
                <p className="text-white text-opacity-55 text-[12.5px] lg:text-[18.5px]">We make it easy for you to track the accommodations you've applied for</p>
            </div>

            <div className="bg-white p-4 sm:p-6 mx-4 mt-2 mb-4 rounded-xl shrink-0">             
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <span className="block uppercase font-bold text-[11px] lg:text-[14px]" style={{ color: stat.text }}>
                                {stat.label}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex-1 rounded-xl h-5 lg:h-7" style={{ backgroundColor: stat.bg }}>
                                    <div
                                        className="lg:h-7 h-5 rounded-xl flex items-center justify-left pl-2"
                                        style={{
                                            width: `${(stat.count / totalApps) * 100}%`,
                                            background: `linear-gradient(to right, ${stat.from}, ${stat.to})`
                                        }}
                                    >
                                        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-white text-[11px] lg:text-[14px] font-bold">{stat.count}/{totalApps}</span>
                                    </div>
                                </div>
                                <span className="text-[12px] lg:text-[14px] font-bold" style={{ color: stat.text }}>
                                    {Math.round((stat.count / totalApps) * 100)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-2 mb-5 mx-4 rounded-xl flex flex-col min-h-0 flex-1" style={{ height: 'calc(100vh - 2rem)' }}>
                <div className='flex justify-between items-center pb-2'>
                    <div className='px-2'>
                        <h1 className='font-bold text-[15px]'>Application History</h1>
                        <p className='italic text-[11px]'>{totalApps} total applications</p>
                    </div>
                    <div>                       
                        <Dropdown 
                            title="Sort by"
                            items={[
                                { label: "Date applied (Asc.)", href: "" },
                                { label: "Date applied (Desc.)", href: "" },
                                { label: "Reviewed on (Asc.)", href: "" },
                                { label: "Reviewed on (Desc.)", href: "" },
                                { label: "Status", href: "" },
                            ]}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto sm:overflow-x-visible">
                    <table className="table-fixed w-full">
                        <thead className='sticky top-0 bg-[#F7F3F3]'>
                            <tr className="border-b text-[#9A7080] text-[12px] lg:text-[16px] 6B0F2B">
                                <th className='uppercase p-2 text-left whitespace-nowrap w-40'>dormitory</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>date applied</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>reviewed on</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>status</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>remarks</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-16'>action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((app, index) => (
                                <tr key={index} className="border-b text-[12px] lg:text-[15px]">
                                    <td className='px-2 py-2'>
                                        <span className="block text-[13px] font-semibold">{app.dormitory}</span>
                                        <span className="block text-[10px] text-[#9A7080]">{app.type} • {app.location}</span>
                                    </td>
                                    <td className='px-2 py-2 whitespace-nowrap'>
                                        <span className="block text-[12px]">{app.dateApplied}</span>
                                        <span className="block text-[10px] text-[#9A7080]">{timeAgo(app.dateApplied)}</span>
                                    </td>
                                    <td className='px-2 py-2 whitespace-nowrap'>
                                        <span className='block text-[12px]'>{app.reviewedOn}</span>
                                        <span className='block text-[10px] text-[#9A7080]'>{app.reviewedBy}</span>
                                    </td>
                                    <td className='px-2 py-2 text-[12px]'>{app.status}</td>
                                    <td className='px-2 py-2 text-[12px] truncate w-full'>{app.remarks}</td>
                                    <td className='px-2 py-2 text-[12px]'>
                                        <button className="text-[#6B0F2B] text-[12px]">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center m-2 mt-4 text-sm text-[#9A7080]">
                    <span className='text-[11px]'>Showing 1-{ROWS_PER_PAGE} of {totalApps} applications</span>
                    <div className="flex gap-2">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}