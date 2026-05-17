import type { Landlord } from './landlord'
import type { Student } from './student'
import type { Payment } from './payment'

export interface Fee {
  id: number

  landlordId: number
  studentNumber: string

  dueDate: string

  feeCategory: 'rent' | 'utilities' | 'miscellaneous'

  feeAmount: number
  feeBalance: number

  feeStatus: 'paid' | 'unpaid' | 'overdue' | 'partial'

  allowInstallments: boolean

  landlord?: Landlord
  student?: Student
  payments?: Payment[]
}