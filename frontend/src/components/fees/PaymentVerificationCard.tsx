import { useState, useMemo } from "react";
import type { Tenant, PaymentStatus } from "../../pages/landlord/FeesPage";
import Button from "../Button";
import Pagination from '../../components/ApplicationStatus/Pagination';
import SearchBar from '../../components/SearchBar';

interface PaymentVerificationCardProps {
    tenants: Tenant[];
    isLoading: boolean;
    isError: boolean;
    onView: (tenant: Tenant) => void;
}

// Row background colors based on payment status
const rowStyles: Record<PaymentStatus, { bg: string; text: string }> = {
    paid: { bg: '#1A7A4A', text: '#000000' },
    partially_paid: { bg: '#C9973A', text: '#000000' },
    unpaid: { bg: '#9E2040', text: '#000000' },
    pending_verification: { bg: '#F59E0B', text: '#000000' },
};

export default function PaymentVerificationCard({ 
    tenants, 
    isLoading, 
    isError, 
    onView
}: PaymentVerificationCardProps) {
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filter tenants based on search
    const filteredTenants = useMemo(() => {
        if (!searchQuery.trim()) return tenants;
        
        const query = searchQuery.toLowerCase();
        return tenants.filter(tenant => 
            tenant.name.toLowerCase().includes(query) ||
            tenant.roomNumber.toLowerCase().includes(query) ||
            tenant.building.toLowerCase().includes(query)
        );
    }, [tenants, searchQuery]);
    
    const totalTenants = filteredTenants.length;
    const totalPages = Math.ceil(totalTenants / ROWS_PER_PAGE) || 1;
    
    // Pagination slice
    const paginatedTenants = filteredTenants.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    // Reset to page 1 when search changes
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header with Search */}
            <div className="px-5 py-4 border-b border-[#6B0F2B]/10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-[#6B0F2B]">Payment Verification</h2>
                        <span className="text-[10px] lg:text-[12px] text-[#9A7080]">
                            {tenants.length} total tenants
                        </span>
                    </div>
                    
                    {/* Search Bar - aligned to the right */}
                    <div className="flex justify-end">
                        <SearchBar
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onPageReset={() => setCurrentPage(1)}
                            placeholder="Search by name, room, or building..."
                        />
                    </div>
                </div>
            </div>
            
            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full py-12">
                        <p className="text-gray-400 font-medium text-center animate-pulse">
                            Loading tenants...
                        </p>
                    </div>
                ) : isError ? (
                    <div className="flex justify-center items-center h-full py-12">
                        <p className="text-red-500 font-medium text-center">
                            Failed to load tenants.
                        </p>
                    </div>
                ) : filteredTenants.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full py-12 text-center">
                        {searchQuery ? (
                            <>
                                <p className="text-gray-500 font-medium text-lg">No matching tenants found.</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms.</p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 font-medium text-lg">No pending verifications.</p>
                                <p className="text-gray-400 text-sm mt-1">All payments have been verified.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <table className="table-fixed w-full border-separate border-spacing-0">
                            <thead className='sticky z-20 top-0 bg-white border-b-2 border-[#6B0F2B]/5'>
                                <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                                    <th className='uppercase p-3 text-left whitespace-nowrap w-[35%]'>
                                        Student
                                    </th>
                                    <th className='uppercase p-3 text-left whitespace-nowrap'>
                                        Room
                                    </th>
                                    <th className='uppercase p-3 text-left whitespace-nowrap'>
                                        Amount
                                    </th>
                                    <th className='uppercase p-3 text-left whitespace-nowrap'>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTenants.map((tenant) => {
                                    return (
                                        <tr 
                                            key={tenant.id}
                                            className="border-b border-[#6B0F2B]/5 hover:bg-gray-50 transition-colors"
                                            style={{
                                                backgroundColor: (rowStyles[tenant.paymentStatus]?.bg ?? '#888') + '0D',
                                            }}
                                        >
                                            <td className='px-3 py-3'>
                                                <div className="flex flex-row items-center">
                                                    <div className="mx-1 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070]">
                                                        <p className="text-white font-bold text-sm">
                                                            {tenant.name.charAt(0)}
                                                        </p>
                                                    </div>
                                                    <div className='flex flex-col ml-2 justify-center'>
                                                        <span className="block text-[13px] lg:text-[15px] font-semibold text-gray-800">
                                                            {tenant.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-3 py-3 text-[12px] lg:text-[14px] text-gray-700'>
                                                <span className="block">{tenant.roomNumber}</span>
                                                <span className="capitalize block text-[10px] lg:text-[12px] text-[#9A7080]">
                                                    {tenant.building}
                                                </span>
                                            </td>
                                            <td className='px-3 py-3'>
                                                <span className="block text-[12px] lg:text-[14px] font-semibold text-[#C9973A]">
                                                    {formatCurrency(tenant.amountDue)}
                                                </span>
                                            </td>
                                            <td className='px-3 py-3'>
                                                <Button
                                                    variant="reddishPink"
                                                    size="sm"
                                                    fullWidth={false}
                                                    onClick={() => onView(tenant)}
                                                >
                                                    Review
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
            {/* Pagination */}
                        <div className="px-3 py-3 border-t border-[#6B0F2B]/10 bg-white">
                            <div className='flex flex-nowrap justify-between items-center'>
                                <div className='text-[11px] lg:text-[13px] text-[#9A7080]'>
                                    Showing {totalTenants === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, totalTenants)} of {totalTenants} tenants
                                </div>
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
    );
}