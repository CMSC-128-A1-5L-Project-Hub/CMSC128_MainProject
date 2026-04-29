import { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import HeroBanner from "../../components/dashboard/HeroBanner";
import Sidebar from '../../components/Sidebar';
import OverdueFeesCard from '../../components/fees/OverdueFeesCard';
import PaymentVerificationCard from '../../components/fees/PaymentVerificationCard';
import OverdueFeesModal from '../../components/fees/OverdueFeesModal';
import PaymentVerificationModal from '../../components/fees/PaymentVerificationModal';

export type PaymentStatus = "paid" | "partially_paid" | "unpaid" | "pending_verification";

export interface Tenant {
    id: number;
    name: string;
    roomNumber: string;
    building: string;
    roomType: string;
    dateConfirmed: string;
    daysAgo: number;
    paymentStatus: PaymentStatus;
    status: "ACTIVE" | "INACTIVE";
    amountDue?: number;
    receiptImage?: string;
}

// Mock data for now (replace with API call later)
const fetchTenants = async (): Promise<Tenant[]> => {
    // Mock data for development
    return [
        {
            id: 1,
            name: "Ana Marie Reyes",
            roomNumber: "204",
            building: "Building 6",
            roomType: "Solo",
            dateConfirmed: "Mar 18, 2026",
            daysAgo: 23,
            paymentStatus: "unpaid",
            status: "ACTIVE",
            amountDue: 3125
        },
        {
            id: 2,
            name: "Molave Reyes",
            roomNumber: "325",
            building: "Building 3",
            roomType: "Shared",
            dateConfirmed: "Mar 19, 2026",
            daysAgo: 22,
            paymentStatus: "unpaid",
            status: "ACTIVE",
            amountDue: 3125
        },
        {
            id: 3,
            name: "Narra Reyes",
            roomNumber: "102",
            building: "Building 1",
            roomType: "Solo",
            dateConfirmed: "Mar 20, 2026",
            daysAgo: 21,
            paymentStatus: "unpaid",
            status: "ACTIVE",
            amountDue: 3125
        },
        {
            id: 4,
            name: "Kayanne Reyes",
            roomNumber: "101",
            building: "Building 5",
            roomType: "Solo",
            dateConfirmed: "Mar 21, 2026",
            daysAgo: 20,
            paymentStatus: "unpaid",
            status: "ACTIVE",
            amountDue: 3125
        },
        {
            id: 5,
            name: "Jasmine Cruz",
            roomNumber: "456",
            building: "Building 2",
            roomType: "Shared",
            dateConfirmed: "Mar 15, 2026",
            daysAgo: 28,
            paymentStatus: "pending_verification",
            status: "ACTIVE",
            amountDue: 5000
        },
        {
            id: 6,
            name: "Marcus Santos",
            roomNumber: "789",
            building: "Building 4",
            roomType: "Solo",
            dateConfirmed: "Mar 10, 2026",
            daysAgo: 33,
            paymentStatus: "pending_verification",
            status: "ACTIVE",
            amountDue: 5000
        },
        {
            id: 7,
            name: "Isabella Garcia",
            roomNumber: "567",
            building: "Building 3",
            roomType: "Shared",
            dateConfirmed: "Mar 5, 2026",
            daysAgo: 38,
            paymentStatus: "pending_verification",
            status: "ACTIVE",
            amountDue: 5000
        },
        {
            id: 8,
            name: "Daniel Tan",
            roomNumber: "890",
            building: "Building 1",
            roomType: "Solo",
            dateConfirmed: "Mar 25, 2026",
            daysAgo: 16,
            paymentStatus: "paid",
            status: "ACTIVE",
            amountDue: 3125
        },
        {
            id: 9,
            name: "Sofia Lopez",
            roomNumber: "234",
            building: "Building 2",
            roomType: "Shared",
            dateConfirmed: "Mar 28, 2026",
            daysAgo: 13,
            paymentStatus: "partially_paid",
            status: "ACTIVE",
            amountDue: 2500
        },
        {
            id: 10,
            name: "Carlos Mendez",
            roomNumber: "678",
            building: "Building 4",
            roomType: "Solo",
            dateConfirmed: "Mar 30, 2026",
            daysAgo: 11,
            paymentStatus: "paid",
            status: "ACTIVE",
            amountDue: 3125
        },
    ];
};

export default function FeesPage() {
    const [overdueModalOpen, setOverdueModalOpen] = useState(false);
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    // Data fetching
    const { data: tenants = [], isLoading, isError } = useQuery({
        queryKey: ["tenants"],
        queryFn: fetchTenants,
    });
    
    // Filter overdue tenants (unpaid and due date has passed)
    const overdueTenants = useMemo(() => {
        const today = new Date();
        return tenants.filter(tenant => {
            if (tenant.paymentStatus !== 'unpaid') return false;
            const dueDate = new Date(tenant.dateConfirmed);
            return dueDate < today;
        });
    }, [tenants]);
    
    // Filter payment verification tenants (pending verification)
    const verificationTenants = useMemo(() => {
        return tenants.filter(tenant => tenant.paymentStatus === 'pending_verification');
    }, [tenants]);
    
    return (
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-row">
            <hr className="fixed border-t-1 top-16 w-full border-t border-[#6B0F2B] border-opacity-10 my-1" />
            
            <Sidebar role='landlordDashboard' />
            
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className='flex flex-row justify-start items-center mt-3'>
                    <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div>
                    <h1 className='font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] pl-16 lg:p-0'>Billing</h1>
                </div>
                
                <div className='pt-6 px-4'>
                    <HeroBanner
                        greeting="Good Day"
                        name="Ana Reyes"
                        title="Check the billing status of your tenants"
                        subtitle="We make it easy for you to track payment status and verify receipts."
                        type="mini"
                    />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-6 mt-6">
                    {/* Overdue Fees Card */}
                    <OverdueFeesCard
                        tenants={overdueTenants}
                        isLoading={isLoading}
                        isError={isError}
                        onView={(tenant) => {
                            setSelectedTenant(tenant);
                            setOverdueModalOpen(true);
                        }}
                    />
                    
                    {/* Payment Verification Card */}
                    <PaymentVerificationCard
                        tenants={verificationTenants}
                        isLoading={isLoading}
                        isError={isError}
                        onView={(tenant) => {
                            setSelectedTenant(tenant);
                            setVerificationModalOpen(true);
                        }}
                    />  
                </div>
            </div>

            {/* Overdue Fees Modal */}
            {overdueModalOpen && selectedTenant && (
                <OverdueFeesModal
                    tenant={selectedTenant}
                    onClose={() => {
                        setOverdueModalOpen(false);
                        setSelectedTenant(null);
                    }}
                    onSendReminder={async (id) => {
                        console.log(`Send reminder to tenant ${id}`);
                        // TODO: Connect to API
                    }}
                />
            )}

            {/* Payment Verification Modal */}
            {verificationModalOpen && selectedTenant && (
                <PaymentVerificationModal
                    tenant={selectedTenant}
                    onClose={() => {
                        setVerificationModalOpen(false);
                        setSelectedTenant(null);
                    }}
                    onConfirmPayment={async (id, approved) => {
                        console.log(`Confirm payment for tenant ${id}: ${approved ? 'Approved' : 'Rejected'}`);
                        // TODO: Connect to API
                    }}
                />
            )}
        </div>
    );
}