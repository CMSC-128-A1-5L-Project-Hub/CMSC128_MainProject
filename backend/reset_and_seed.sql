-- ============================================================
-- RESET DATABASE – drops all tables, recreates with latest schema
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS fees;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS transient_bookings;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS room_tags;
DROP TABLE IF EXISTS accommodation_tags;
DROP TABLE IF EXISTS accommodation_images;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS managers;
DROP TABLE IF EXISTS landlords;
DROP TABLE IF EXISTS phone_numbers;
DROP TABLE IF EXISTS sys_variables;
DROP TABLE IF EXISTS file_metadata;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. FILE METADATA
-- ============================================================
CREATE TABLE file_metadata (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('document', 'image') NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- 2. USERS AND PROFILES
-- ============================================================
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

-- ============================================================
-- 3. ACCOMMODATIONS AND ROOMS
-- ============================================================
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

-- ============================================================
-- 4. APPLICATIONS (with new columns)
-- ============================================================
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

-- ============================================================
-- 5. ASSIGNMENTS, REVIEWS, BOOKMARKS, FEES, PAYMENTS, LOGS, NOTIFICATIONS, SYS_VARS
-- ============================================================
CREATE TABLE assignments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(11) NOT NULL,
    room_id INT UNSIGNED NOT NULL,
    confirmed_date DATE NOT NULL,
    move_in DATE NOT NULL,
    expected_move_out DATE NOT NULL,
    actual_move_out DATE NULL,
    grace_period_days INT NOT NULL DEFAULT 5,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
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

CREATE TABLE bookmarks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(11) NOT NULL,
    accommodation_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE fees (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT UNSIGNED NOT NULL,
    student_number VARCHAR(11) NOT NULL,
    due_date DATE NOT NULL,
    fee_category ENUM('rent','utilities','miscellaneous') NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_balance DECIMAL(10,2) NOT NULL,
    fee_status ENUM('paid','unpaid','overdue','partial') NOT NULL,
    FOREIGN KEY (landlord_id) REFERENCES landlords(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fee_id INT UNSIGNED NOT NULL,
    proof_file_id INT UNSIGNED NOT NULL UNIQUE,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10,2) NOT NULL,
    mode_of_payment VARCHAR(30) NOT NULL,
    payment_status ENUM('pending','verified','rejected') DEFAULT 'pending',
    FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
    FOREIGN KEY (proof_file_id) REFERENCES file_metadata(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

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

-- ============================================================
-- 6. TRANSIENT BOOKINGS (new table)
-- ============================================================
CREATE TABLE transient_bookings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id INT UNSIGNED NOT NULL,
    student_number VARCHAR(11) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_deadline TIMESTAMP NOT NULL,
    proof_file_id INT UNSIGNED NULL,
    status ENUM('pending_payment','pending_verification','confirmed','rejected','expired') NOT NULL DEFAULT 'pending_payment',
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE,
    FOREIGN KEY (proof_file_id) REFERENCES file_metadata(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 7. RATE LIMITS (optional)
-- ============================================================
CREATE TABLE rate_limits (
    key_str VARCHAR(255) PRIMARY KEY,
    points INT NOT NULL DEFAULT 0,
    expire BIGINT UNSIGNED
) ENGINE=InnoDB;

-- ============================================================
-- 8. SEED DATA
-- ============================================================

-- ----- File metadata (unique entries needed for proofs) -----
INSERT INTO file_metadata (file_name, file_path, file_type) VALUES
('default_pfp.png','/defaults/default_pfp.png','image'),
('enroll_s1.pdf','/docs/enroll_s1.pdf','document'),
('enroll_s2.pdf','/docs/enroll_s2.pdf','document'),
('enroll_s3.pdf','/docs/enroll_s3.pdf','document'),
('enroll_s4.pdf','/docs/enroll_s4.pdf','document'),
('enroll_s5.pdf','/docs/enroll_s5.pdf','document'),
('business_permit_1.pdf','/docs/business_permit_1.pdf','document'),
('business_permit_2.pdf','/docs/business_permit_2.pdf','document'),
('accom1_img1.jpg','/images/accom1_img1.jpg','image'),
('accom2_img1.jpg','/images/accom2_img1.jpg','image'),
('receipt1.jpg','/payments/receipt1.jpg','image');

-- ----- Users -----
INSERT INTO users (id, fname, lname, email, role, account_status) VALUES
(1, 'Larkin', 'Sanchez', 'larkinsanchez@gmail.com', 'landlord', 'active'),
(2, 'Mimi', 'Yuuhhh', 'yuuhhhmimi@gmail.com', 'manager', 'active'),
(3, 'Louise', 'Martinez', 'lvmartinez@up.edu.ph', 'student', 'active'),
(4, 'Avrielle', 'Juarez', 'afjuarez@up.edu.ph', 'student', 'active'),
(5, 'Daniel', 'Santos', 'djsantos@up.edu.ph', 'student', 'active'),
(6, 'Kristine', 'Villanueva', 'kjvillanueva@up.edu.ph', 'student', 'active'),
(7, 'Joshua', 'Aguilar', 'jdaguilar@up.edu.ph', 'student', 'active'),
(8, 'Juan', 'Dela Cruz', 'juan.delacruz@gmail.com', 'manager', 'active');

-- Add manager 
INSERT INTO managers (user_id, manager_status) VALUES (2, 'active'), (8, 'active');

-- ----- Phone numbers -----
INSERT INTO phone_numbers (user_id, contact_number, is_primary) VALUES
(1, '09171234567', TRUE),
(2, '09987654321', TRUE),
(3, '09281234567', TRUE),
(4, '09391234567', TRUE),
(5, '09451234567', TRUE),
(6, '09561234567', TRUE),
(7, '09671234567', TRUE),
(8, '09165478322', TRUE);

-- ----- Landlord / Manager -----
INSERT INTO landlords (user_id, tin) VALUES (1, '123-456-789-000');

-- ----- Students (each with unique enrollment proof) -----
INSERT INTO students (student_number, user_id, enrollment_proof_file_id, college, degree_program, gender, year_level) VALUES
('2023-123456', 3, 2, 'CEAT', 'BS Industrial Engineering', 'Female', '3rd Year'),
('2023-123457', 4, 3, 'CEAT', 'BS Civil Engineering', 'Female', '2nd Year'),
('2023-123460', 5, 4, 'CEAT', 'BS Industrial Engineering', 'Male', '2nd Year'),
('2023-123461', 6, 5, 'CBA', 'BS Accountancy', 'Female', '5th Year'),
('2023-123462', 7, 6, 'CITE', 'BS Computer Science', 'Male', '3rd Year');

-- ----- Accommodations (managed by Mimi) -----
INSERT INTO accommodations (id, landlord_id, manager_id, business_permit_id, accommodation_name, accommodation_location, accommodation_type, accommodation_capacity, tenant_restriction, status, latitude, longitude) VALUES
(1, 1, 2, 7, 'White House', 'Ruby St., Los Baños', 'off-campus', 60, 'coed', 'verified', 14.1665, 121.2430),
(2, 1, 8, 8, 'Narra Residences', 'UPLB, Los Baños', 'on-campus', 80, 'female-only', 'verified', 14.1650, 121.2400);

-- Accommodation tags
INSERT INTO accommodation_tags (accommodation_id, tag_detail) VALUES
(1, 'Near campus'), (1, 'Pet friendly'),
(2, '24/7 Security'), (2, 'Has study area');

-- ----- Rooms (multiple types and tags for price variants) -----
-- White House (acc 1)
INSERT INTO rooms (accommodation_id, room_number, room_type, room_stay_type, room_capacity, room_current_occupancy, room_building, room_rent, tenant_restriction, room_availability) VALUES
-- single transient
(1, '101', 'single', 'transient', 1, 0, 'A', 5000.00, 'coed', 'available'),
-- double non-transient without AC
(1, '201', 'double', 'non_transient', 2, 0, 'A', 3500.00, 'coed', 'available'),
-- double non-transient with AC
(1, '203', 'double', 'non_transient', 2, 0, 'A', 4000.00, 'coed', 'available'),
-- shared transient
(1, '301', 'shared', 'transient', 4, 2, 'B', 800.00, 'coed', 'occupied');

-- Narra Residences (acc 2) female-only
INSERT INTO rooms (accommodation_id, room_number, room_type, room_stay_type, room_capacity, room_current_occupancy, room_building, room_rent, tenant_restriction, room_availability) VALUES
(2, '101-F', 'single', 'non_transient', 1, 0, 'Main', 5500.00, 'non-coed', 'available'),
(2, '102-F', 'double', 'non_transient', 2, 0, 'Main', 4000.00, 'non-coed', 'available');

-- Room tags for price variants
INSERT INTO room_tags (room_id, tag_detail) VALUES
(2, 'fan-cooled'),             -- room 2 (White House 201)
(3, 'air-conditioned'),        -- room 3 (White House 201-AC)
(5, 'shared bathroom'),        -- room 5 (Narra 101-F)
(6, 'air-conditioned'),        -- room 6 (Narra 102-F)
(6, 'study desk');

-- ----- Applications (various statuses for testing) -----
INSERT INTO applications (id, accommodation_id, student_number, application_room_type, application_stay_type, application_status, duration_of_stay_days, preferred_tags) VALUES
-- Pending applications for White House (FIFO order: first applied first in list)
(1, 1, '2023-123456', 'single', 'non_transient', 'pending', 30, NULL),
(2, 1, '2023-123457', 'double', 'non_transient', 'pending', 180, '["air-conditioned"]'),
(3, 1, '2023-123460', 'double', 'non_transient', 'pending', 180, '["air-conditioned"]'),
-- Waitlisted application
(4, 1, '2023-123461', 'shared', 'transient', 'waitlisted', 90, NULL),
-- Under review (already accepted by manager, waiting landlord)
(5, 1, '2023-123462', 'shared', 'non_transient', 'under_review', 365, NULL),
-- Approved (needs student confirmation)
(6, 1, '2023-123456', 'double', 'non_transient', 'approved', 180, '["air-conditioned"]'),
-- Confirmed (ready for assignment) – for testing assignment flow
(7, 1, '2023-123457', 'double', 'non_transient', 'confirmed', 180, '["air-conditioned"]'),
-- Rejected
(8, 1, '2023-123462', 'single', 'transient', 'rejected', 15, NULL),
-- Cancelled by student
(9, 1, '2023-123460', 'shared', 'transient', 'cancelled', 7, NULL),
-- Another confirmed for Narra (female-only)
(10, 2, '2023-123456', 'single', 'non_transient', 'confirmed', 365, NULL),
-- Another pending for Narra
(11, 2, '2023-123457', 'double', 'non_transient', 'pending', 180, '["air-conditioned"]');

-- Set approved_at for approved apps
UPDATE applications SET approved_at = NOW() WHERE application_status = 'approved';

-- ----- Assignments (some filled) -----
-- Assign confirmed student 2023-123457 (app 7) to room 201-AC (id 3)
INSERT INTO assignments (id, student_number, room_id, confirmed_date, move_in, expected_move_out, grace_period_days) VALUES
(1, '2023-123457', 3, '2026-04-20', '2026-04-22', '2026-10-22', 5);
-- Update room occupancy
UPDATE rooms SET room_current_occupancy = 1, room_availability = 'occupied' WHERE id = 3;

-- Assign a past assignment (moved out) for testing moves
INSERT INTO assignments (id, student_number, room_id, confirmed_date, move_in, expected_move_out, actual_move_out, grace_period_days) VALUES
(2, '2023-123456', 2, '2026-03-01', '2026-03-01', '2026-09-01', '2026-04-23', 5);

-- ----- Logs (recent activity) -----
INSERT INTO logs (actor_id, entity_type, entity_id, log_timestamp, activity_type, activity_details) VALUES
(2, 'application', 5, '2026-04-23 09:15:00', 'MANAGER_APPROVED', 'Manager approved application #5 for Joshua Aguilar'),
(2, 'assignment', 1, '2026-04-23 10:00:00', 'MANAGER_ASSIGNED_ROOM', 'Student Avrielle Juarez assigned to room 201-AC'),
(2, 'assignment', 2, '2026-04-23 11:00:00', 'MANAGER_MOVED_OUT', 'Student Louise Martinez moved out of room 201');

-- ----- System variables -----
INSERT INTO sys_variables (current_semester, current_sy, sem_start_date, uplb_latitude, uplb_longitude) VALUES
('second_sem', '2025-2026', '2026-01-12', 14.1651, 121.2402);