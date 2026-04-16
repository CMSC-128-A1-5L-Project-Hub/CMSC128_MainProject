import { useState, useMemo } from 'react'
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

    const sortedApplications = useMemo(() => {
        return [...applications].sort((a, b) => {
            const parseDate = (str: string) => str === '-' ? 0 : new Date(str).getTime();

            if (sortBy === "Date applied (Asc.)")  return parseDate(a.dateApplied) - parseDate(b.dateApplied);
            if (sortBy === "Date applied (Desc.)") return parseDate(b.dateApplied) - parseDate(a.dateApplied);
            if (sortBy === "Reviewed on (Asc.)")   return parseDate(a.reviewedOn)  - parseDate(b.reviewedOn);
            if (sortBy === "Reviewed on (Desc.)")  return parseDate(b.reviewedOn)  - parseDate(a.reviewedOn);
            if (sortBy === "Status") return a.status.localeCompare(b.status);
            return 0;

        });
    }, [sortBy]);

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

    const totalApps = sortedApplications.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedApplications.length / ROWS_PER_PAGE);
    const paginated = sortedApplications.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, i) => (
                        <div key={stat.label} className={i===0 ? "col-span-2 lg:col-span-1" : "col-span-1"}>
                            <span className="block uppercase font-bold text-[11px] lg:text-[14px]" style={{ color: stat.text }}>
                                {stat.label}
                            </span>
                            <div className="flex flex-grow items-center gap-3 mt-1">
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
                            direction = "down"
                            onSelect={(label) => {setSortBy(label); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 min-h-0">
                    <table className="table-fixed w-full">
                        <thead className='sticky top-0 bg-[#F7F3F3]'>
                            <tr className=" border-[#6B0F2B] border-opacity-5 border-b-2 text-[#9A7080] text-[12px] lg:text-[16px] 6B0F2B">
                                <th className='uppercase p-2 text-left whitespace-nowrap w-40'>dormitory</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>date applied</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>reviewed on</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>status</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-32'>remarks</th>
                                <th className='uppercase p-2 text-left whitespace-nowrap w-24'>action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((app, index) => (
                                <tr key={index} className="text-[12px] lg:text-[15px]"
                                style = {{ backgroundColor: (rowStyles[app.status]?.bg ?? '#888')  + '0D',
                                    color: (rowStyles[app.status]?.text ?? '#888'),
                                }}>
                                    <td className='px-2 py-2 border-[#6B0F2B]'>
                                        <span className="block text-[13px] font-semibold">{app.dormitory}</span>
                                        <span className="block text-[10px] text-[#9A7080]">{app.type} • {app.location}</span>
                                    </td>
                                    <td className='px-2 py-2 whitespace-nowrap border-[#6B0F2B] '>
                                        <span className="block text-[12px]">{app.dateApplied}</span>
                                        <span className="block text-[10px] text-[#9A7080]">{timeAgo(app.dateApplied)}</span>
                                    </td>
                                    <td className='px-2 py-2 whitespace-nowrap border-[#6B0F2B] '>
                                        <span className='block text-[12px]'>{app.reviewedOn}</span>
                                        <span className='block text-[10px] text-[#9A7080]'>{app.reviewedBy}</span>
                                    </td>
                                    <td className='text-[11px] capitalize border-[#6B0F2B]font-bold'>
                                        <div className='bg-opacity-10 p-2 w-fit rounded-[50px] flex flex-row'
                                            style = {{ backgroundColor: (statusStyles[app.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                        >
                                            <div className='p-1.5 w-1.5 h-1.5 mr-1.5 mt-0.5 rounded-[100px]'
                                                style = {{ backgroundColor: statusStyles[app.status]?.dot ?? '#888' }}
                                            />
                                            <p style = {{ color: statusStyles[app.status]?.text ?? '#888',
                                                fontWeight: 'bold',
                                            }}>{app.status}</p>
                                        </div>
                                    </td>
                                    <td className='px-2 py-2 text-[12px] truncate w-full border-[#6B0F2B]'>{app.remarks}</td>
                                    <td className='px-2 py-2 text-[12px] border-[#6B0F2B]'>
                                        <button className="text-[#6B0F2B] font-semibold text-[12px] border-2 py-1 px-4 bg-[#F5ECF0] border-[#6B0F2B] border-opacity-5 rounded-[8.8px]">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                <div className='flex flex-nowrap justify-between'>
                    <div className='flex justify-start items-center gap-2'>
                        <div className='m-1 mt-3'>                       
                            <Dropdown 
                                title="No. of Items"
                                items={[
                                    { label: "5", href: "" },
                                    { label: "10", href: "" },
                                    { label: "15", href: "" },
                                    { label: "20", href: "" },
                                ]}
                                direction='up'
                                onSelect={(label) => {setRows(parseInt(label, 10)); setCurrentPage(1)}}
                            />
                            
                        </div>
                        <span className='text-[11px] text-[#9A7080] p-0 m-0'>Showing {(currentPage-1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, totalApps)} of {totalApps}</span>
                    </div>
                        
                    
                    <div className="flex justify-between items-center m-2 mt-4 text-sm text-[#9A7080]">     
                        <div className="flex gap-2 text-[12px]">
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}