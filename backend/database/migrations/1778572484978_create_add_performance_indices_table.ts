import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Applications table - heavily queried for listings, status checks
    this.schema.alterTable('applications', (table) => {
      table.index(['accommodation_id', 'application_status'], 'idx_apps_acc_status')
      table.index(['student_number', 'application_status'], 'idx_apps_student_status')
      table.index(['application_date'], 'idx_apps_date')
      table.index(['accommodation_id'], 'idx_apps_acc')
      table.index(['student_number'], 'idx_apps_student')
    })

    // Rooms - filtered by type, availability, and accommodation
    this.schema.alterTable('rooms', (table) => {
      table.index(['accommodation_id', 'room_availability'], 'idx_rooms_acc_avail')
      table.index(['room_type', 'room_stay_type'], 'idx_rooms_type_stay')
      table.index(['accommodation_id'], 'idx_rooms_acc')
    })

    // Assignments - finding active assignments, move-in/out tracking
    this.schema.alterTable('assignments', (table) => {
      table.index(['student_number', 'actual_move_out'], 'idx_assign_student_moveout')
      table.index(['room_id'], 'idx_assign_room')
      table.index(['student_number'], 'idx_assign_student')
    })

    // Reviews - filtered by accommodation
    this.schema.alterTable('reviews', (table) => {
      table.index(['accommodation_id'], 'idx_reviews_acc')
    })

    // Fees - filtered by student and status
    this.schema.alterTable('fees', (table) => {
      table.index(['student_number', 'fee_status'], 'idx_fees_student_status')
      table.index(['landlord_id'], 'idx_fees_landlord')
    })

    // Payments - filtered by fee and status
    this.schema.alterTable('payments', (table) => {
      table.index(['fee_id'], 'idx_payments_fee')
      table.index(['payment_status'], 'idx_payments_status')
    })

    // Users - email lookups, role filtering
    this.schema.alterTable('users', (table) => {
      table.index(['email'], 'idx_users_email')
      table.index(['role', 'account_status'], 'idx_users_role_status')
    })

    // Accommodations - status filtering, landlord/manager lookups
    this.schema.alterTable('accommodations', (table) => {
      table.index(['status'], 'idx_acc_status')
      table.index(['landlord_id'], 'idx_acc_landlord')
      table.index(['manager_id'], 'idx_acc_manager')
    })

    // Notifications - user-specific, read/unread filtering
    this.schema.alterTable('notifications', (table) => {
      table.index(['user_id', 'read_status'], 'idx_notif_user_read')
    })

    // Logs - filtering by actor and timestamp
    this.schema.alterTable('logs', (table) => {
      table.index(['actor_id', 'entity_type'], 'idx_logs_actor_entity')
      table.index(['log_timestamp'], 'idx_logs_timestamp')
    })
  }

  async down() {
    this.schema.alterTable('applications', (table) => {
      table.dropIndex([], 'idx_apps_acc_status')
      table.dropIndex([], 'idx_apps_student_status')
      table.dropIndex([], 'idx_apps_date')
      table.dropIndex([], 'idx_apps_acc')
      table.dropIndex([], 'idx_apps_student')
    })
    this.schema.alterTable('rooms', (table) => {
      table.dropIndex([], 'idx_rooms_acc_avail')
      table.dropIndex([], 'idx_rooms_type_stay')
      table.dropIndex([], 'idx_rooms_acc')
    })
    this.schema.alterTable('assignments', (table) => {
      table.dropIndex([], 'idx_assign_student_moveout')
      table.dropIndex([], 'idx_assign_room')
      table.dropIndex([], 'idx_assign_student')
    })
    this.schema.alterTable('reviews', (table) => {
      table.dropIndex([], 'idx_reviews_acc')
    })
    this.schema.alterTable('fees', (table) => {
      table.dropIndex([], 'idx_fees_student_status')
      table.dropIndex([], 'idx_fees_landlord')
    })
    this.schema.alterTable('payments', (table) => {
      table.dropIndex([], 'idx_payments_fee')
      table.dropIndex([], 'idx_payments_status')
    })
    this.schema.alterTable('users', (table) => {
      table.dropIndex([], 'idx_users_email')
      table.dropIndex([], 'idx_users_role_status')
    })
    this.schema.alterTable('accommodations', (table) => {
      table.dropIndex([], 'idx_acc_status')
      table.dropIndex([], 'idx_acc_landlord')
      table.dropIndex([], 'idx_acc_manager')
    })
    this.schema.alterTable('notifications', (table) => {
      table.dropIndex([], 'idx_notif_user_read')
    })
    this.schema.alterTable('logs', (table) => {
      table.dropIndex([], 'idx_logs_actor_entity')
      table.dropIndex([], 'idx_logs_timestamp')
    })
  }
}