import { useState } from 'react'
import TopNav from '../../components/TopNav'
import SideBar from '../../components/SideBar'


export default function ApplicationStatus() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const stats = [
        { label: 'approved', count: 1, total: 6, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
        { label: 'pending', count: 2, total: 6, from: '#C9973A', to: '#E8C37A', bg: '#FDF6EC', text: '#C9973A' },
        { label: 'under review', count: 1, total: 6, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
        { label: 'rejected', count: 2, total: 6, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
    ]

    return (
        <div className="min-h-screen bg-[#F5EEF0]">

            <TopNav title="Application Status" onMenuClick={() => setSidebarOpen(true)} />
            <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 sm:p-6 m-4 rounded-xl">
                <p className="uppercase text-[#C9973A] text-[12px] lg:text-[16px]">Good day, Ana Reyes</p>
                <h1 className="font-bold text-[20.22px] lg:text-[28px] text-white">Check your application status</h1>
                <p className="text-white text-opacity-55 text-[12.5px] lg:text-[18.5px]">We make it easy for you to track the accommodations you've applied for</p>
            </div>

            <div className="bg-white p-4 sm:p-6 m-4  rounded-xl">             
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <span className="block uppercase font-bold text-[11px] lg:text-[15px]" style={{ color: stat.text }}>
                                {stat.label}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex-1 rounded-xl h-5 lg:h-7" style={{ backgroundColor: stat.bg }}>
                                    <div
                                        className="lg:h-7 h-5 rounded-xl flex items-center justify-left pl-2"
                                        style={{
                                            width: `${(stat.count / stat.total) * 100}%`,
                                            background: `linear-gradient(to right, ${stat.from}, ${stat.to})`
                                        }}
                                    >
                                        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-white text-[11px] lg:text-[14px] font-bold">{stat.count}/{stat.total}</span>
                                    </div>
                                </div>
                                    <span className="text-[11px] lg:text-[1px] font-bold" style={{ color: stat.text }}>
                                        {Math.round((stat.count / stat.total) * 100)}%
                                    </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-2 sm:p-5 m-4 rounded-xl overflow-x-auto">
                <div>
                    <div>
                        
                    </div>
                </div>


                <table className="table-auto sm:table-fixed w-full">
                    <thead>
                        <tr className="border-b text-[#9A7080] text-[12px] lg:text-[16px]">
                            <th className='uppercase px-2 py-1 text-left whitespace-nowrap'>dormitory</th>
                            <th className='uppercase px-2 py-1 text-left whitespace-nowrap'>date applied</th>
                            <th className='uppercase px-2 py-1 text-left whitespace-nowrap'>reviewed on</th>
                            <th className='uppercase px-2 py-1 text-left whitespace-nowrap'>status</th>
                            <th className='uppercase px-2 py-1 text-left whitespace-nowrap'>remarks</th>
                            <th className='uppercase px-2 py-1 text-left whitespace-nowrap'>action</th>
                        </tr>

                    </thead>
                    <tbody>
                        <tr>
                            <td className='px-2 py-1'>poopoo</td>
                        </tr>
                    </tbody>

                </table>
            </div>

        </div>
    )
}

