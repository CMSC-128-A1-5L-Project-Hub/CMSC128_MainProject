import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
// Imports: Accommodation, Room, Fee, Application, etc.

export default class ReportService {
  
  // Calculates Total Capacity vs Occupied, grouped by gender
  static async getOccupancyStats(user: User) {
    const totalsRow = await db
      .from('accommodations')
      .innerJoin('rooms', 'rooms.accommodation_id', 'accommodations.id')
      .where('accommodations.landlord_id', user.id)
      .sum('rooms.room_capacity as total_capacity')
      .sum('rooms.room_current_occupancy as currently_occupied')
      .first()

    const genderRows = await db
      .from('assignments')
      .innerJoin('rooms', 'rooms.id', 'assignments.room_id')
      .innerJoin('accommodations', 'accommodations.id', 'rooms.accommodation_id')
      .innerJoin('students', 'students.student_number', 'assignments.student_number')
      .where('accommodations.landlord_id', user.id)
      .whereNull('assignments.actual_move_out')
      .select('students.gender')
      .count('* as count')
      .groupBy('students.gender')

    const totalCapacity = Number(totalsRow?.total_capacity ?? 0)
    const currentlyOccupied = Number(totalsRow?.currently_occupied ?? 0)
    const vacantSlots = Math.max(totalCapacity - currentlyOccupied, 0)

    const breakdown = genderRows.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.gender] = Number(row.count ?? 0)
        return acc
      },
      {}
    )

    return {
      totalCapacity,
      currentlyOccupied,
      vacantSlots,
      breakdown,
    }
  }

  // Groups applications by MONTH(application_date)
  static async getApplicationTrends(user: User) {
    // Logic: Query applications table, group by month and status.
    const rows = await db
      .from('applications')
      .innerJoin('accommodations', 'accommodations.id', 'applications.accommodation_id')
      .where('accommodations.landlord_id', user.id)
      .select(
        db.raw("DATE_FORMAT(applications.application_date, '%Y-%m') as month"),
        'applications.application_status as status'
      )
      .count('* as count')
      .groupByRaw("DATE_FORMAT(applications.application_date, '%Y-%m'), applications.application_status")
      .orderBy('month', 'asc')

    const grouped = rows.reduce((acc: Record<string, any>, row: any) => {
      const month = row.month
      const status = row.status
      const count = Number(row.count ?? 0)

      if (!acc[month]) {
        acc[month] = {
          month,
          total: 0,
          statuses: {},
        }
      }

      acc[month].statuses[status] = count
      acc[month].total += count

      return acc
    }, {})

    return Object.values(grouped)
  }

  // Calculates potential revenue based on active assignments
  static async getRevenueProjections(user: User) {
    // Logic: Sum of room prices for all active assignments in landlord's dorms.
    const rows = await db
      .from('assignments')
      .innerJoin('rooms', 'rooms.id', 'assignments.room_id')
      .innerJoin('accommodations', 'accommodations.id', 'rooms.accommodation_id')
      .where('accommodations.landlord_id', user.id)
      .whereNull('assignments.actual_move_out')
      .select(
        'accommodations.id as accommodation_id',
        'accommodations.accommodation_name as accommodation_name',
        'rooms.id as room_id',
        'rooms.room_number',
        'rooms.room_rent as rent'
      )
      .count('assignments.id as assigned_students')
      .groupBy(
        'accommodations.id',
        'accommodations.accommodation_name',
        'rooms.id',
        'rooms.room_number',
        'rooms.room_rent'
      )

    const roomBreakdown = rows.map((row: any) => {
      const assignedStudents = Number(row.assigned_students ?? 0)
      const rent = Number(row.rent ?? 0)
      const projectedRevenue = assignedStudents * rent

      return {
        accommodation_id: row.accommodation_id,
        accommodation_name: row.accommodation_name,
        room_id: row.room_id,
        room_number: row.room_number,
        rent,
        assigned_students: assignedStudents,
        projected_monthly_revenue: projectedRevenue,
      }
    })

    const projectedMonthlyRevenue = roomBreakdown.reduce((sum, row) => {
      return sum + row.projected_monthly_revenue
    }, 0)

    return {
      projectedMonthlyRevenue,
      rooms: roomBreakdown,
    }
  }

  // Finds students with overdue fees
  static async getDelinquentStudents(user: User) {
    // Logic: Query fees where status is 'unpaid' or 'partial' AND due_date < NOW() - 5 days.
    const rows = await db
      .from('fees')
      .innerJoin('students', 'students.student_number', 'fees.student_number')
      .innerJoin('users', 'users.id', 'students.user_id')
      .where('fees.landlord_id', user.id)
      .whereIn('fees.fee_status', ['unpaid', 'partial', 'overdue'])
      .whereRaw('fees.due_date < DATE_SUB(CURDATE(), INTERVAL 5 DAY)')
      .select(
        'fees.id',
        'fees.student_number',
        'fees.due_date',
        'fees.fee_category as category',
        'fees.fee_amount as amount',
        'fees.fee_balance as balance',
        'fees.fee_status as status',
        'students.gender',
        'users.fname',
        'users.mname',
        'users.lname',
        'users.email'
      )
      .orderBy('fees.due_date', 'asc')

    return rows.map((row: any) => ({
      fee_id: row.id,
      student_number: row.student_number,
      student_name: [row.fname, row.mname, row.lname].filter(Boolean).join(' '),
      email: row.email,
      gender: row.gender,
      due_date: row.due_date,
      category: row.category,
      amount: Number(row.amount ?? 0),
      balance: Number(row.balance ?? 0),
      status: row.status,
    }))
  }

  // Students currently on the waiting list for this landlord's accommodations
  static async getWaitingList(user: User) {
    const rows = await db
      .from('applications')
      .innerJoin('accommodations', 'accommodations.id', 'applications.accommodation_id')
      .innerJoin('students', 'students.student_number', 'applications.student_number')
      .innerJoin('users', 'users.id', 'students.user_id')
      .where('accommodations.landlord_id', user.id)
      .where('applications.application_status', 'waitlisted')
      .select(
        'applications.id as application_id',
        'applications.application_date',
        'applications.application_room_type as room_type',
        'applications.application_stay_type as stay_type',
        'accommodations.accommodation_name',
        'students.student_number',
        'students.gender',
        'users.fname',
        'users.mname',
        'users.lname',
        'users.email'
      )
      .orderBy('applications.application_date', 'asc')

    return rows.map((row: any) => ({
      application_id: row.application_id,
      student_number: row.student_number,
      student_name: [row.fname, row.mname, row.lname].filter(Boolean).join(' '),
      email: row.email,
      gender: row.gender,
      accommodation_name: row.accommodation_name,
      room_type: row.room_type,
      stay_type: row.stay_type,
      application_date: row.application_date,
    }))
  }

  // Students currently housed (active assignments) in this landlord's accommodations
  static async getHousedStudents(user: User) {
    const rows = await db
      .from('assignments')
      .innerJoin('rooms', 'rooms.id', 'assignments.room_id')
      .innerJoin('accommodations', 'accommodations.id', 'rooms.accommodation_id')
      .innerJoin('students', 'students.student_number', 'assignments.student_number')
      .innerJoin('users', 'users.id', 'students.user_id')
      .where('accommodations.landlord_id', user.id)
      .whereNull('assignments.actual_move_out')
      .select(
        'assignments.id as assignment_id',
        'assignments.move_in',
        'assignments.expected_move_out',
        'accommodations.accommodation_name',
        'rooms.room_number',
        'rooms.room_rent as rent',
        'students.student_number',
        'students.gender',
        'users.fname',
        'users.mname',
        'users.lname',
        'users.email'
      )
      .orderBy('accommodations.accommodation_name', 'asc')
      .orderBy('rooms.room_number', 'asc')

    return rows.map((row: any) => ({
      assignment_id: row.assignment_id,
      student_number: row.student_number,
      student_name: [row.fname, row.mname, row.lname].filter(Boolean).join(' '),
      email: row.email,
      gender: row.gender,
      accommodation_name: row.accommodation_name,
      room_number: row.room_number,
      rent: Number(row.rent ?? 0),
      move_in: row.move_in,
      expected_move_out: row.expected_move_out,
    }))
  }

  // History of completed (moved-out) assignments for this landlord's accommodations
  static async getAccommodationHistory(user: User) {
    const rows = await db
      .from('assignments')
      .innerJoin('rooms', 'rooms.id', 'assignments.room_id')
      .innerJoin('accommodations', 'accommodations.id', 'rooms.accommodation_id')
      .innerJoin('students', 'students.student_number', 'assignments.student_number')
      .innerJoin('users', 'users.id', 'students.user_id')
      .where('accommodations.landlord_id', user.id)
      .whereNotNull('assignments.actual_move_out')
      .select(
        'assignments.id as assignment_id',
        'assignments.move_in',
        'assignments.actual_move_out',
        'accommodations.accommodation_name',
        'rooms.room_number',
        'students.student_number',
        'users.fname',
        'users.mname',
        'users.lname'
      )
      .orderBy('assignments.actual_move_out', 'desc')

    return rows.map((row: any) => ({
      assignment_id: row.assignment_id,
      student_number: row.student_number,
      student_name: [row.fname, row.mname, row.lname].filter(Boolean).join(' '),
      accommodation_name: row.accommodation_name,
      room_number: row.room_number,
      move_in: row.move_in,
      actual_move_out: row.actual_move_out,
    }))
  }
}