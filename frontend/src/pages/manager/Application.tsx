import Sidebar from '../../components/Sidebar';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  BellRing
} from 'lucide-react';
import { useMemo } from 'react';

// --- Types Based on SQL Schema ---

type RoomType = 'single' | 'double' | 'shared';
type StayType = 'transient' | 'non_transient';
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review';

interface Application {
  id: number;
  accommodation_id: number;
  student_number: string;
  student_name: string; 
  application_date: string;
  room_type: RoomType;
  stay_type: StayType;
  status: ApplicationStatus;
  duration_of_stay_days: number;
  rejection_reason?: string;
}

// --- Mock Data ---

const mockApplications: Application[] = [
  { 
    id: 1, 
    accommodation_id: 5, 
    student_number: '2023-11370', 
    student_name: 'Kayanne Reyes',
    application_date: '2026-03-12T13:00:00',
    room_type: 'shared', 
    stay_type: 'non_transient', 
    status: 'approved',
    duration_of_stay_days: 150 
  },
  { 
    id: 2, 
    accommodation_id: 1, 
    student_number: '2023-11452', 
    student_name: 'Molave Reyes',
    application_date: '2026-03-14T11:15:00',
    room_type: 'shared', 
    stay_type: 'non_transient', 
    status: 'pending',
    duration_of_stay_days: 150 
  },
  { 
    id: 3, 
    accommodation_id: 6, 
    student_number: '2024-00129', 
    student_name: 'Narra Reyes',
    application_date: '2026-03-15T14:10:00',
    room_type: 'double', 
    stay_type: 'transient', 
    status: 'under_review',
    duration_of_stay_days: 5 
  },
  { 
    id: 4, 
    accommodation_id: 2, 
    student_number: '2023-09821', 
    student_name: 'Yakal Reyes',
    application_date: '2026-03-16T09:00:00',
    room_type: 'shared', 
    stay_type: 'non_transient', 
    status: 'waitlisted',
    duration_of_stay_days: 150 
  },
  { 
    id: 5, 
    accommodation_id: 1, 
    student_number: '2022-10023', 
    student_name: 'Ilang Reyes',
    application_date: '2026-03-17T13:46:00',
    room_type: 'single', 
    stay_type: 'non_transient', 
    status: 'rejected',
    duration_of_stay_days: 150,
    rejection_reason: 'Incomplete documentation.'
  },
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const config: Record<ApplicationStatus, { bg: string, text: string, dot: string, label: string }> = {
    approved: { bg: 'bg-[#1A7A4A]/15', text: 'text-[#1A7A4A]', dot: 'bg-[#1A7A4A]', label: 'Approved'},
    pending: { bg: 'bg-[#C9973A]/15', text: 'text-[#C9973A]', dot: 'bg-[#C9973A]', label: 'Pending' },
    under_review: { bg: 'bg-[#6B3AB7]/15', text: 'text-[#6B3AB7]', dot: 'bg-[#6B3AB7]', label: 'In Review' },
    rejected: { bg: 'bg-[#9E2040]/15', text: 'text-[#9E2040]', dot: 'bg-[#9E2040]', label: 'Rejected' },
    cancelled: { bg: 'bg-[#9E2040]/15', text: 'text-[#9E2040]', dot: 'bg-[#9E2040]', label: 'Cancelled' },
    waitlisted: { bg: 'bg-[#6B0F2B]/15', text: 'text-[#6B0F2B]', dot: 'bg-[#6B0F2B]', label: 'Waitlisted' },
  };
  const { bg, text, dot, label } = config[status];

  return (
    // Changed w-fit to w-28 (112px) and added justify-center
    <span className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center justify-center gap-1.5 w-24 ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="truncate font-sans text-[0.55rem]">{label}</span>
    </span>
  );
};

const DaysAgo = ({ targetDate }: { targetDate: string }) => {
    const daysDifference = useMemo(() => {
        const now = new Date();
        const past = new Date(targetDate); // Date() constructor accepts strings!
        
        now.setHours(0, 0, 0, 0);
        past.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(now.getTime() - past.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }, [targetDate]);

    return <span>{daysDifference} days ago</span>;
};

export default function ApplicationsScreen() {
    return (
        <div className="min-h-screen bg-[#FCF8F9] flex flex-col lg:flex-row text-slate-800 font-sans">
        
            <Sidebar role={'manager'} />
            <main className="flex-1 pb-10">
                
                {/* Top Header - Mobile First */}
                <header className="sticky top-0 z-50 flex flex-col px-4 lg:px-10 pt-5 pb-3 bg-white border-b lg:border-none border-slate-100">
                    <div className='flex flex-row'>
                        <div className='lg:hidden xs:block'><Sidebar role={'manager'} /></div>
                        <div className="flex flex-row items-center justify-start w-full gap-4">
                            <h1 className="text-2xl lg:text-4xl ml-14 font-serif font-bold italic text-[#5B1D2E] ">Applications</h1>
                        </div> {/* Header Left */}
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-2xl bg-[#856363]/15 relative">
                                <BellRing className="w-5 h-5 text-[#C92121]" />
                            </button>
                        </div> {/* Header Right */}
                    </div>
                    <div className="w-full h-px bg-[#5B1D2E]/40 mt-3"></div>
                </header> {/* Main Header */}

                <div className="px-4 lg:px-10 space-y-6">
                
                    {/* Hero Banner */}
                    <section className="rounded-2xl bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-6 lg:p-10 text-white shadow-xl shadow-maroon-900/10 relative overflow-hidden">
                        <div className="relative z-10">
                        <p className="text-xs font-sans tracking-[0.2em] text-[#C9973A] uppercase mb-1">Good Day, <span className="font-bold">Ana Reyes</span>!</p>
                        <h2 className="text-2xl lg:text-4xl font-sans font-bold">Check your applicants</h2>
                        <p className="text-white/55 text-xs lg:text-sm font-sans mt-2 max-w-xs">We make it easy for you to track the accomodation applications you manage</p>
                        </div> {/* Hero Text */}
                    </section> {/* Hero Banner */}

                    {/* Quick Stats Grid */}
                    <section className="bg-white grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 rounded-xl border border-slate-100 shadow-sm">
                        {[
                        { label: 'APPROVED', val: '1/6', p: '17%', color: '#1A7A4A' },
                        { label: 'PENDING', val: '2/6', p: '35%', color: '#C9973A' },
                        { label: 'IN REVIEW', val: '1/6', p: '17%', color: '#6B3AB7' },
                        { label: 'REJECTED', val: '1/6', p: '17%', color: '#9E2040' },
                        ].map((s) => (
                        <div key={s.label} className=" p-4">
                            <div className="flex justify-between font-sans text-sm font-semibold mb-2" style={{color: s.color}}>
                            <span>{s.label}</span>
                            </div> {/* Stat Label Row */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: `rgb(from ${s.color} r g b / 0.05)` }}>
                                    <div 
                                        className="h-full transition-all duration-500" 
                                        style={{ width: s.p, backgroundColor: s.color} } 
                                    >
                                        <span className="ml-3 text-sm font-sans font-bold text-black">{s.val}</span>
                                    </div>
                                </div> {/* Progress Bar */}
                                <span className="font-sans font-semibold" style={{color: s.color}}>{s.p}</span>
                            </div> {/* Stat Progress Row */}
                        </div> 
                        ))}
                    </section> {/* Stats Grid */}

                    {/* Table / List Container */}
                    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        
                        <div className="p-4 lg:p-6 flex flex-row justify-between items-center gap-4 border-b border-slate-50">
                            <div>
                                <h3 className="text-[0.80rem] font-extrabold font-sans text-[#1A0008]">Application History</h3>
                                <p className="text-[0.55rem] text-[#9A7080] uppercase font-normal tracking-wider">6 total applications</p>
                            </div> {/* Title Area */}
                            <div className='flex flex-row items-center justify-between w-1/3 border border-[#6B0F2B]/20 px-3 rounded-2xl'>
                                <div>
                                    <p className='font-sans text-[#9A7080]  font-extrabold text-xs'>SORT BY</p>
                                    <p className='font-sans text-[0.6rem] text-[#1A0008]'>Latest First</p>
                                </div>
                                <button className='px-0'>
                                    <ChevronDown className="w-6 h-6 text-[#6B0F2B]" />
                                </button>
                            </div>
                            <div className="flex flex-1 flex-row items-center h-[3rem] bg-[#FAF4F6] border border-[#6B0F2B]/20 rounded-2xl px-3 overflow-hidden">
                                <Search className="w-6 h-6 text-[#9A7080] shrink-0" />
                                <input 
                                    type="text" 
                                    placeholder="Search Application" 
                                    className="flex-1 h-full bg-transparent outline-none text-sm ml-2"
                                />
                            </div> {/* Search Input */}
                        </div> {/* Header Controls */}

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Student Info</th>
                                <th className="px-6 py-4">Stay Details</th>
                                <th className="px-6 py-4">Applied On</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {mockApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#5B1D2E] text-white flex items-center justify-center font-bold text-xs">
                                        {app.student_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{app.student_name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{app.student_number}</div>
                                    </div>
                                    </div> {/* Student Avatar/Info */}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-semibold capitalize text-slate-700">
                                    {app.room_type} Room • Bldg {app.accommodation_id}
                                    </div>
                                    <div className="text-[10px] text-slate-400 capitalize">
                                    {app.stay_type.replace('_', '-')} • {app.duration_of_stay_days} days
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-medium text-slate-600">
                                    {new Date(app.application_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                    {new Date(app.application_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={app.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="px-4 py-1.5 bg-[#FDF2F5] text-[#5B1D2E] text-[10px] font-black rounded-lg hover:bg-[#F5E9EC] transition-colors">
                                    VIEW
                                    </button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div> {/* Desktop Table */}

                        {/* Phone view */}
                        <div className="md:hidden grid grid-cols-[19%_20.5%_20.5%_19%_16%] gap-x-1">

                            {/* Header row — no grid-cols needed here */}
                            <div className="contents">
                                <div className="flex items-center justify-center pl-3 py-2 font-sans font-medium text-[0.55rem] text-[#9A7080]">STUDENTS</div>
                                <div className="flex items-center justify-center px-0 py-2 font-sans font-medium text-[0.55rem] text-[#9A7080]">
                                    <button className='px-0'><ChevronDown className="w-3 h-3" /></button>
                                    DATE APPLIED
                                </div>
                                <div className="flex items-center justify-center px-0 py-2 font-sans font-medium text-[0.55rem] text-[#9A7080]">
                                    <button className='px-0'><ChevronDown className="w-3 h-3" /></button>
                                    REVIEWED ON
                                </div>
                                <div className="flex items-center justify-center px-0 py-2 font-sans font-medium text-[0.55rem] text-[#9A7080]">
                                    <button className='px-0'><ChevronDown className="w-3 h-3" /></button>
                                    STATUS
                                </div>
                                <div className="flex items-center justify-center px-0 py-2 font-sans font-medium text-[0.55rem] text-[#9A7080]">ACTION</div>
                            </div>

                            {/* Body rows — same contents trick */}
                            {mockApplications.map((app, i) => (
                                <div key={app.id} className="contents group">

                                    {/* Students */}
                                    <div className="flex flex-col px-4 py-3 items-center">
                                        <div className='flex items-center justify-center bg-[#3D0718] rounded-lg text-white text-base font-sans font-semibold w-10 h-10'>{app.student_name[0]}</div>
                                        <p className='text-[#1A0008] font-sans text-xs text-center font-semibold py-1'>{app.student_name}</p>
                                    </div>

                                    {/* Date Applied */}
                                    <div className="flex flex-col items-center justify-center px-0">
                                        <p className='text-xs font-sans text-[#1A0008] font-medium'>
                                            {new Date(app.application_date).toLocaleDateString('en-US', {
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className='text-[0.65rem] font-sans text-[#C8B0B8]'>
                                            {DaysAgo({ targetDate: app.application_date })}
                                        </p>
                                    </div>

                                    {/* Reviewed On */}
                                    <div className="flex flex-col items-center justify-center px-0">
                                        {app.status === "pending" ? (
                                            <div className='flex flex-col justify-center items-center'>
                                                <p className='font-sans text-[#C8B0B8] text-xs px-0'>-</p>
                                                <p className='flex text-center font-sans text-[#C8B0B8] text-xs px-0'>Not yet reviewed</p>
                                            </div>) : (
                                            <div className="flex flex-col items-center justify-center px-0">
                                                <p className='text-xs font-sans text-[#1A0008] font-medium'>
                                                    {new Date(app.application_date).toLocaleDateString('en-US', {
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className='text-[0.65rem] font-sans text-[#C8B0B8]'>
                                                    by {app.accommodation_id}
                                                </p>
                                            </div>)
                                        }
                                    </div>

                                    {/* Status */}
                                    <div className="flex px-0 justify-center items-center text-sm">
                                        <StatusBadge status={app.status} />
                                    </div>

                                    {/* Action */}
                                    <div className="flex justify-center items-center px-2 py-3">
                                        <button className='px-3 w-20 font-sans bg-[#F5ECF0] stroke-[#6B0F2B] border rounded-2xl text-[#6B0F2B] text-[0.6rem]'>View</button>
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Pagination */}
                        <div className="p-4 lg:p-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
                            <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase">1–5 OF 6 APPLICATIONS</span>
                            <div className="flex items-center gap-1">
                                <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5B1D2E] text-white text-xs font-bold shadow-md shadow-maroon-900/20">1</button>
                                <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 text-xs font-bold bg-white">2</button>
                                <button className='flex items-center justify-center rounded-lg border border-slate-200 bg-white'>
                                    <ChevronRight className="px-0 bx-0 mx-0 w-3 h-3 stroke-[2px]" />
                                </button>
                            </div> {/* Pagination Buttons */}
                        </div> {/* Pagination Footer */}

                    </section> {/* Application Container */}
                </div> {/* Content Body */}
            </main> {/* Main Content Wrapper */}
        </div> 
    );
}