import type { Application } from "../../pages/student/ApplicationStatus";
import StylizedStatus from "../BillingDashboard/StylizedStatus";
import Button from "../Button";

interface ApplicationTableProps {
    applications: Application[];
    onView: (application: Application) => void;
}

const rowStyles: Record<string, { bg: string; text: string}> = {
    approved:      { bg: '#1A7A4A', text: '#000000'},
    pending:       { bg: '#FFFFFF', text: '#000000'},
    'under review':{ bg: '#6B3AB7', text: '#000000'},
    rejected:      { bg: '#6B0F2B', text: '#9A7080'},
    waitlisted:    { bg: '#EFF4FF', text: '#000000'},
}

function timeAgo(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
}

export default function ApplicationTable({applications, onView}: ApplicationTableProps){
    return (
        <table className= "table-fixed w-full border-separate border-spacing-0">
            <thead className='sticky z-20 top-0 rounded-t-lg bg-white border-y-2 border-[#6B0F2B]/5'>
                <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                {[
                    { label: 'dormitory',   width: 'w-40' },
                    { label: 'date applied',      width: 'w-32' },
                    { label: 'status',      width: 'w-32' },
                    { label: 'remarks',      width: 'w-44' },
                    { label: 'action',      width: 'w-36' },
                ].map(col => (
                    <th key = {col.label} className={`uppercase p-2 text-left whitespace-nowrap border-y-2 border-[#6B0F2B]/5`}>
                        {col.label}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {applications.map((app, index) => (
                    <tr key={index}
                    style = {{ backgroundColor: (rowStyles[app.status]?.bg ?? '#888')  + '0D',
                        color: (rowStyles[app.status]?.text ?? '#888'),
                    }}>
                        <td className='px-2 py-2 flex flex-row items-center'>
                            <div className="mr-1 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070]">
                                <p className=" text-white items-center justify-center font-bold text-sm">{app.dormitory[0]}</p>
                            </div>
                            <div className='flex flex-col ml-1 justify-center'>
                                <span className="block text-[13px] lg:text-[15px] font-semibold">{app.dormitory}</span>
                                <span className="capitalize block text-[10px] -mt-1 lg:text-[12px] text-[#9A7080]">{app.room_type} • {app.location}</span>
                            </div>
                        </td>
                        <td className='px-2 py-2'>
                            <span className="block text-[12px] lg:text-[14px]">{app.application_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">{timeAgo(app.application_date)}</span>
                        </td>
                        <td className='px-2 py-2'>
                            <StylizedStatus
                                status = {app.status}>
                            </StylizedStatus>
                        </td>
                        <td className='text-[11px] capitalize'>
                            {app.rejection_reason ?? '-'}
                        </td>
                        <td className='px-2 py-2 text-[12px] lg:text-[14px]'>
                            <div className='flex flex-row gap-2 '>
                                <Button 
                                    variant="reddishPink"
                                    size="sm"
                                    fullWidth={false}
                                    isLoading={false}
                                    onClick={() => {onView(app)}}
                                    >
                                        View
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}


