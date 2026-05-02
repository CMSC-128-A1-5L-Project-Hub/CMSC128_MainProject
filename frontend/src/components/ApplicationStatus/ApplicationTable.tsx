import type { Application } from "./ApplicationStatusModal";
import StylizedStatus from "../BillingDashboard/StylizedStatus";
import Button from "../Button";

interface ApplicationTableProps {
    applications: Application[];
    onView: (application: Application) => void;
}

const rowStyles: Record<string, { bg: string; text: string }> = {
    approved:     { bg: '#1A7A4A', text: '#000000' },
    pending:      { bg: '#FFFFFF', text: '#000000' },
    under_review: { bg: '#6B3AB7', text: '#000000' },
    rejected:     { bg: '#6B0F2B', text: '#9A7080' },
    waitlisted:   { bg: '#EFF4FF', text: '#000000' },
    cancelled:    { bg: '#F0F0F0', text: '#888888' },
}

function timeAgo(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
}

export default function ApplicationTable({ applications, onView }: ApplicationTableProps) {
    return (
        <table className="table-fixed w-full border-separate border-spacing-0">
            <thead className='sticky z-20 top-0 rounded-t-lg bg-white border-y-2 border-[#6B0F2B]/5'>
                <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                    {[
                        { label: 'dormitory' },
                        { label: 'date applied' },
                        { label: 'status' },
                        { label: 'remarks' },
                        { label: 'action' },
                    ].map(col => (
                        <th key={col.label} className='uppercase p-2 text-left whitespace-nowrap border-y-2 border-[#6B0F2B]/5'>
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {applications.map((app, index) => {
                    const applicationDate = new Date(app.applicationDate);
                    return (
                        <tr key={index}
                            style={{
                                backgroundColor: (rowStyles[app.applicationStatus]?.bg ?? '#888') + '0D',
                                color: rowStyles[app.applicationStatus]?.text ?? '#888',
                            }}>
                            <td className='px-2 py-2 flex flex-row items-center'>
                                <div className="mx-1 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070]">
                                    <p className="text-white font-bold text-sm">
                                        {app.accommodation.accommodationName[0]}
                                    </p>
                                </div>
                                <div className='flex flex-col ml-1 justify-center'>
                                    <span className="block text-[13px] lg:text-[15px] font-semibold">
                                        {app.accommodation.accommodationName}
                                    </span>
                                    <span className="capitalize block text-[10px] -mt-1 lg:text-[12px] text-[#9A7080]">
                                        {app.applicationRoomType} • {app.accommodation.accommodationLocation}
                                    </span>
                                </div>
                            </td>
                            <td className='px-2 py-2'>
                                <span className="block text-[12px] lg:text-[14px]">
                                    {applicationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">
                                    {timeAgo(applicationDate)}
                                </span>
                            </td>
                            <td className='px-2 py-2'>
                                <StylizedStatus status={app.applicationStatus} />
                            </td>
                            <td className='px-2 py-2 text-[11px] capitalize'>
                                {app.rejectionReason ?? '-'}
                            </td>
                            <td className='px-2 py-2 text-[12px] lg:text-[14px]'>
                                <Button
                                    variant="reddishPink"
                                    size="sm"
                                    fullWidth={false}
                                    isLoading={false}
                                    onClick={() => onView(app)}>
                                    View
                                </Button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    )
}