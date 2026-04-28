-- ============================================================
-- FULL RESET & SEED
-- yuuhhhmimi@gmail.com is a student
-- allow_installments is TRUE only for rent fees
-- payment_status uses: 'pending', 'verified', 'rejected'
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications, logs, payments, fees, reports, assignments,
                     applications, transient_bookings, bookmarks, reviews, room_tags,
                     accommodation_tags, accommodation_images, rooms, accommodations,
                     documents, students, managers, landlords, phone_numbers,
                     sys_variables, file_metadata, rate_limits, users;

SET FOREIGN_KEY_CHECKS = 1;

-- ── 1. file_metadata ─────────────────────────────────────────
CREATE TABLE file_metadata (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('document','image') NOT NULL
) ENGINE=InnoDB;

-- ── 2. users ─────────────────────────────────────────────────
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pfp_file_id INT UNSIGNED NULL,
    fname VARCHAR(50) NOT NULL,
    mname VARCHAR(50) NULL,
    lname VARCHAR(50) NOT NULL,
    suffix VARCHAR(10) NULL,
    email VARCHAR(75) NOT NULL UNIQUE,
    facebook_account VARCHAR(100) NULL,
    role ENUM('student','landlord','manager','unassigned','super_admin') NOT NULL DEFAULT 'unassigned',
    account_status ENUM('pending','active','suspended') NULL,
    otp_code VARCHAR(50) NULL,
    otp_expires_at TIMESTAMP NULL,
    FOREIGN KEY (pfp_file_id) REFERENCES file_metadata(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE phone_numbers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    contact_number VARCHAR(11) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE landlords (
    user_id INT UNSIGNED PRIMARY KEY,
    tin VARCHAR(18) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE managers (
    user_id INT UNSIGNED PRIMARY KEY,
    manager_status ENUM('active','inactive') NOT NULL DEFAULT 'inactive',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE students (
    student_number VARCHAR(11) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    enrollment_proof_file_id INT UNSIGNED NOT NULL UNIQUE,
    college VARCHAR(5) NOT NULL,
    degree_program VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_number VARCHAR(11) NULL,
    form5_renewal BOOLEAN DEFAULT FALSE,
    year_level ENUM('1st Year','2nd Year','3rd Year','4th Year','5th Year') NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_proof_file_id) REFERENCES file_metadata(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ── 3. accommodations & rooms ────────────────────────────────
CREATE TABLE accommodations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT UNSIGNED NOT NULL,
    manager_id INT UNSIGNED NULL UNIQUE,
    business_permit_id INT UNSIGNED NOT NULL UNIQUE,
    accommodation_name VARCHAR(50) NOT NULL UNIQUE,
    accommodation_location VARCHAR(150) NOT NULL,
    invited_manager_email VARCHAR(255) NULL,
    longitude DECIMAL(9,6) NULL,
    latitude DECIMAL(9,6) NULL,
    walking_distance INT NULL,
    biking_distance INT NULL,
    driving_distance INT NULL,
    accommodation_type ENUM('on-campus','off-campus','partner_housing') NOT NULL,
    status ENUM('pending','verified','rejected') DEFAULT 'pending',
    accommodation_capacity INT NOT NULL,
    accommodation_size INT NULL,
    tenant_restriction ENUM('male-only','female-only','coed') NOT NULL,
    application_start_date DATE NULL,
    application_end_date DATE NULL,
    primary_image_index INT DEFAULT 0,
    is_frozen BOOLEAN DEFAULT FALSE,
    freeze_reason VARCHAR(255) NULL,
    freeze_started_at TIMESTAMP NULL,
    FOREIGN KEY (landlord_id) REFERENCES landlords(user_id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES managers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (business_permit_id) REFERENCES file_metadata(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE accommodation_tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT UNSIGNED NOT NULL,
    tag_detail VARCHAR(30) NOT NULL,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    INDEX idx_tag_detail_accom (tag_detail, accommodation_id)
) ENGINE=InnoDB;

CREATE TABLE accommodation_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT UNSIGNED NOT NULL,
    image_file_id INT UNSIGNED NOT NULL UNIQUE,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    FOREIGN KEY (image_file_id) REFERENCES file_metadata(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE rooms (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT UNSIGNED NOT NULL,
    room_number VARCHAR(5) NOT NULL,
    room_type ENUM('single','double','shared') NOT NULL,
    room_stay_type ENUM('transient','non_transient') NOT NULL,
    room_capacity INT NOT NULL,
    room_current_occupancy INT NOT NULL,
    room_building VARCHAR(20) NOT NULL,
    room_rent DECIMAL(10,2) NOT NULL,
    tenant_restriction ENUM('coed','non-coed') NOT NULL,
    room_availability ENUM('available','occupied','maintenance') NOT NULL,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE room_tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id INT UNSIGNED NOT NULL,
    tag_detail VARCHAR(30) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_tag_detail_room (tag_detail, room_id)
) ENGINE=InnoDB;

-- ── 4. applications ──────────────────────────────────────────
CREATE TABLE applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT UNSIGNED NOT NULL,
    student_number VARCHAR(11) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_room_type ENUM('single','double','shared') NOT NULL,
    application_stay_type ENUM('transient','non_transient') NOT NULL,
    application_status ENUM('pending','approved','rejected','cancelled','waitlisted','under_review','confirmed') NOT NULL,
    duration_of_stay_days INT NOT NULL,
    rejection_reason VARCHAR(255) NULL,
    preferred_tags JSON NULL,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 5. assignments ───────────────────────────────────────────
CREATE TABLE assignments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(11) NOT NULL,
    room_id INT UNSIGNED NOT NULL,
    confirmed_date DATE NOT NULL,
    move_in DATE NOT NULL,
    expected_move_out DATE NOT NULL,
    actual_move_out DATE NULL,
    grace_period_days INT NOT NULL DEFAULT 5,
    confirmation_status ENUM('pending_confirmation','active','rejected','cancelled') NOT NULL DEFAULT 'pending_confirmation',
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 6. fees ──────────────────────────────────────────────────
CREATE TABLE fees (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT UNSIGNED NOT NULL,
    student_number VARCHAR(11) NOT NULL,
    due_date DATE NOT NULL,
    fee_category ENUM('rent','utilities','miscellaneous') NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_balance DECIMAL(10,2) NOT NULL,
    fee_status ENUM('paid','unpaid','overdue','partial') NOT NULL,
    allow_installments BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (landlord_id) REFERENCES landlords(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 7. payments ──────────────────────────────────────────────
-- payment_status: 'pending' = awaiting verification, 'verified' = approved, 'rejected' = rejected
CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fee_id INT UNSIGNED NOT NULL,
    proof_file_id INT UNSIGNED NULL,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10,2) NOT NULL,
    mode_of_payment VARCHAR(30) NOT NULL,
    payment_status ENUM('pending','verified','rejected') DEFAULT 'pending',
    FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
    FOREIGN KEY (proof_file_id) REFERENCES file_metadata(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 8. logs & notifications ──────────────────────────────────
CREATE TABLE logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_id INT UNSIGNED NULL,
    entity_type ENUM('application','assignment','payment','room','accommodation','document','report','fee','account') NOT NULL,
    entity_id INT NOT NULL,
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activity_type VARCHAR(50) NOT NULL,
    activity_details VARCHAR(200) NULL,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    notification_content TEXT NOT NULL,
    read_status ENUM('read','unread') DEFAULT 'unread',
    notification_type ENUM('fee_due','application_status','system','other') NOT NULL,
    notification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sys_variables (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    current_semester ENUM('first_sem','second_sem','midyear') NOT NULL,
    current_sy VARCHAR(9) NOT NULL,
    sem_start_date DATE NOT NULL,
    uplb_latitude DECIMAL(9,6) NOT NULL,
    uplb_longitude DECIMAL(9,6) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT UNSIGNED NOT NULL,
    student_number VARCHAR(11) NOT NULL,
    rating INT NOT NULL,
    content VARCHAR(500) NULL,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- file metadata
INSERT INTO file_metadata (id, file_name, file_path, file_type) VALUES
(1, 'pfp.png',         '/defaults/pfp.png',         'image'),
(2, 'enroll_mimi.pdf', '/docs/enroll_mimi.pdf',      'document'),
(3, 'permit1.pdf',     '/docs/permit1.pdf',           'document');

-- users
-- 1: Larkin (landlord), 2: Mimi (student), 3: Juan (manager)
INSERT INTO users (id, fname, lname, email, role, account_status) VALUES
(1, 'Larkin', 'Sanchez',   'larkinsanchez@gmail.com',  'landlord', 'active'),
(2, 'Mimi',   'Yuuhhh',    'yuuhhhmimi@gmail.com',     'student',  'active'),
(3, 'Juan',   'Dela Cruz', 'juan.delacruz@gmail.com',  'manager',  'active');

INSERT INTO phone_numbers (user_id, contact_number, is_primary) VALUES
(1, '09171234567', TRUE),
(2, '09987654321', TRUE),
(3, '09165478322', TRUE);

INSERT INTO landlords (user_id, tin) VALUES (1, '123-456-789-000');
INSERT INTO managers  (user_id, manager_status) VALUES (3, 'active');

INSERT INTO students (student_number, user_id, enrollment_proof_file_id, college, degree_program, gender, year_level) VALUES
('2023-123456', 2, 2, 'CAS', 'BS Computer Science', 'Female', '3rd Year');

-- accommodation
INSERT INTO accommodations (id, landlord_id, manager_id, business_permit_id, accommodation_name, accommodation_location, accommodation_type, accommodation_capacity, tenant_restriction, status, latitude, longitude) VALUES
(1, 1, 3, 3, 'White House', 'Ruby St., Los Baños', 'off-campus', 60, 'coed', 'verified', 14.1665, 121.2430);

INSERT INTO accommodation_tags (accommodation_id, tag_detail) VALUES
(1, 'Near campus'),
(1, 'Pet friendly');

-- rooms
INSERT INTO rooms (id, accommodation_id, room_number, room_type, room_stay_type, room_capacity, room_current_occupancy, room_building, room_rent, tenant_restriction, room_availability) VALUES
(1, 1, '101', 'single', 'non_transient', 1, 0, 'A', 5000.00, 'coed', 'available'),
(2, 1, '102', 'single', 'non_transient', 1, 1, 'A', 4800.00, 'coed', 'occupied');

INSERT INTO room_tags (room_id, tag_detail) VALUES
(1, 'air-conditioned'),
(1, 'study desk');

-- assignment: Mimi lives in room 102
INSERT INTO assignments (id, student_number, room_id, confirmed_date, move_in, expected_move_out, confirmation_status) VALUES
(1, '2023-123456', 2, '2026-01-15', '2026-01-20', '2026-06-20', 'active');

UPDATE rooms SET room_current_occupancy = 1, room_availability = 'occupied' WHERE id = 2;

-- application
INSERT INTO applications (id, accommodation_id, student_number, application_room_type, application_stay_type, application_status, duration_of_stay_days, application_date) VALUES
(1, 1, '2023-123456', 'single', 'non_transient', 'confirmed', 180, '2026-01-10 10:00:00');

-- ── FEES ─────────────────────────────────────────────────────
-- Rules enforced:
--   allow_installments = TRUE only for rent fees
--   payment_status uses 'pending' | 'verified' | 'rejected'
--
-- February 2026 – all paid
INSERT INTO fees (id, landlord_id, student_number, due_date, fee_category, fee_amount, fee_balance, fee_status, allow_installments) VALUES
(1,  1, '2023-123456', '2026-02-01', 'rent',          4800.00,    0.00, 'paid',   TRUE),
(2,  1, '2023-123456', '2026-02-01', 'utilities',     1200.00,    0.00, 'paid',   FALSE),
(3,  1, '2023-123456', '2026-02-01', 'miscellaneous',  500.00,    0.00, 'paid',   FALSE),

-- March 2026 – rent & utilities paid, one partial utilities (overdue)
(4,  1, '2023-123456', '2026-03-01', 'rent',          4800.00,    0.00, 'paid',   TRUE),
(5,  1, '2023-123456', '2026-03-01', 'utilities',     1100.00,    0.00, 'paid',   FALSE),

-- April 2026 – paid
(6,  1, '2023-123456', '2026-04-01', 'rent',          4800.00,    0.00, 'paid',   TRUE),
(7,  1, '2023-123456', '2026-04-01', 'utilities',     1150.00,    0.00, 'paid',   FALSE),

-- May 2026 – unpaid (rent allows installments, utilities does not)
(8,  1, '2023-123456', '2026-05-01', 'rent',          4800.00, 4800.00, 'unpaid', TRUE),
(9,  1, '2023-123456', '2026-05-01', 'utilities',     1300.00, 1300.00, 'unpaid', FALSE),

-- June 2026 – unpaid
(10, 1, '2023-123456', '2026-06-01', 'rent',          4800.00, 4800.00, 'unpaid', TRUE),
(11, 1, '2023-123456', '2026-06-01', 'utilities',     1200.00, 1200.00, 'unpaid', FALSE),

-- March 2026 – partial rent (installments allowed, balance 400 remaining)
(12, 1, '2023-123456', '2026-03-01', 'rent',          1100.00,  400.00, 'partial', TRUE),

-- February 2026 – overdue miscellaneous (no installments)
(13, 1, '2023-123456', '2026-02-01', 'miscellaneous',  500.00,  500.00, 'overdue', FALSE);

-- ── PAYMENTS ─────────────────────────────────────────────────
INSERT INTO payments (id, fee_id, payment_amount, mode_of_payment, payment_status) VALUES
(1, 1,  4800.00, 'online', 'verified'),
(2, 2,  1200.00, 'cash',   'verified'),
(3, 3,   500.00, 'online', 'verified'),
(4, 4,  4800.00, 'online', 'verified'),
(5, 5,  1100.00, 'cash',   'verified'),
(6, 6,  4800.00, 'online', 'verified'),
(7, 7,  1150.00, 'online', 'verified'),
-- partial payment for fee 12 (rent, originally 1100, balance now 400)
(8, 12,  700.00, 'cash',   'verified');

-- ── LOGS ─────────────────────────────────────────────────────
INSERT INTO logs (actor_id, entity_type, entity_id, activity_type, activity_details) VALUES
(1, 'fee', 1,  'manual_fee_created', 'Feb rent created for Mimi'),
(1, 'fee', 8,  'manual_fee_created', 'May rent created for Mimi – installments allowed'),
(1, 'fee', 12, 'manual_fee_created', 'Mar rent created for Mimi – installments allowed');

-- ── NOTIFICATIONS ────────────────────────────────────────────
INSERT INTO notifications (user_id, notification_content, read_status, notification_type) VALUES
(2, 'Your rent for May 2026 is now due.',                        'unread', 'fee_due'),
(2, 'Your application for White House has been confirmed.',       'read',   'application_status'),
(2, 'You have an overdue miscellaneous fee from February 2026.', 'unread', 'fee_due');

-- ── SYS VARIABLES ────────────────────────────────────────────
INSERT INTO sys_variables (current_semester, current_sy, sem_start_date, uplb_latitude, uplb_longitude) VALUES
('second_sem', '2025-2026', '2026-01-12', 14.1651, 121.2402);