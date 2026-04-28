import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../src/api/axios'
import type { Bill } from '../src/pages/student/BillingDashboard'

async function fetchFees(): Promise<Bill[]> {
    const { data } = await api.get('/my-fees')
    const raw: any[] = data.data ?? data

    return raw.map(row => ({
        id: row.id,
        landlord_id: row.landlord_id,
        student_number: row.student_number,
        due_date: row.due_date,
        category: row.category,
        amount: Number(row.amount),        
        balance: Number(row.balance),      
        status: row.status,
        allowInstallments: Boolean(row.allowInstallments),
        accommodation_name: row.accommodation_name,
    }))
}

export function useFees(){
    return useQuery({
        queryKey: ['student-fees'],
        queryFn: fetchFees,
        staleTime: 1000 * 60 * 5,
    })
}

async function uploadPaymentProof({
    feeId,
    paymentAmount,
    modeOfPayment,
    receiptFile,
}: {
    feeId: number
    paymentAmount: number
    modeOfPayment: string 
    receiptFile?: File | null
}) {
    const formData = new FormData()

    if(receiptFile){
        formData.append('receipt', receiptFile)
    }
    formData.append('paymentAmount', String(paymentAmount))
    formData.append('modeOfPayment', modeOfPayment)

    const { data } = await api.post(`payments/${feeId}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data'},
    })

    return data
}

export function useUploadPayment(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: uploadPaymentProof,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-fees'] })
        },
    })
}