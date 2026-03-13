-- Database Schema for ALL entities

 -- FILE METADATA
 -- for easier tracking of files
CREATE TABLE IF NOT EXISTS file_metadata(
    file_id INT AUTO_INCREMENT,
    file_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('document', 'image') NOT NULL,
    CONSTRAINT file_metadata_file_id_pk PRIMARY KEY (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER
-- For easier authentication, role-based tables are to reference the user_id instead
CREATE TABLE IF NOT EXISTS user(
    user_id INT AUTO_INCREMENT,
    pfp_file_id INT NOT NULL, -- profile metadata
    fname VARCHAR(50) NOT NULL,
    mname VARCHAR(50),
    lname VARCHAR(50) NOT NULL,
    suffix VARCHAR(10),
    email VARCHAR(75) NOT NULL,
    facebook_account VARCHAR(100) NULL, -- optional
    role ENUM('student', 'landlord', 'manager') NOT NULL,
    CONSTRAINT user_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT user_email_uk UNIQUE (email),
    CONSTRAINT user_pfp_file_id_fk FOREIGN KEY (pfp_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT user_pfp_file_id_uk UNIQUE (pfp_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PHONE NUMBER
CREATE TABLE IF NOT EXISTS phone_number(
    phone_number_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    contact_number VARCHAR(11) NOT NULL,
    is_primary ENUM('true', 'false') DEFAULT 'false', -- determine if phone number is the user's primary phone number
    CONSTRAINT phone_number_phone_number_id_pk PRIMARY KEY (phone_number_id),
    CONSTRAINT phone_number_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id),
    CONSTRAINT phone_number_contact_number_uk UNIQUE (contact_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LANDLORD
CREATE TABLE IF NOT EXISTS landlord(
    user_id INT NOT NULL,
    tin VARCHAR(15) NOT NULL, -- tax identification number
    CONSTRAINT landlord_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT landlord_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MANAGER
CREATE TABLE IF NOT EXISTS manager(
    user_id INT NOT NULL,
    manager_status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive',
    CONSTRAINT manager_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT manager_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STUDENT
CREATE TABLE IF NOT EXISTS student(
    student_number VARCHAR(10) NOT NULL, -- will act as the PK instead of user_id
    user_id INT NOT NULL,
    -- form 5/notice of admission (if freshie)
    enrollment_proof_file_id INT NOT NULL,
    college VARCHAR(5) NOT NULL,
    degree_program VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NUll, -- for male-only / female-only dorms
    -- emergency contact info (optional)
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_number VARCHAR(11) NULL,
    CONSTRAINT student_student_number_pk PRIMARY KEY (student_number),
    CONSTRAINT student_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id),
    CONSTRAINT student_enrollment_proof_file_id_fk FOREIGN KEY (enrollment_proof_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT student_user_id_uk UNIQUE (user_id),
    CONSTRAINT student_enrollment_proof_file_id_uk UNIQUE (enrollment_proof_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOCUMENT
CREATE TABLE IF NOT EXISTS document(
    document_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT document_document_id_pk PRIMARY KEY (document_id),
    CONSTRAINT document_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id),
    CONSTRAINT document_file_id_fk FOREIGN KEY (file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT document_file_id_uk UNIQUE (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ACCOMMODATION
CREATE TABLE IF NOT EXISTS accommodation(
    accommodation_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    manager_id INT NOT NULL,
    business_permit_id INT NOT NULL,  -- file reference
    accommodation_name VARCHAR(50) NOT NULL,
    accommodation_location VARCHAR(150) NOT NULL,
    longitude DECIMAL(9,6) NULL,
    latitude DECIMAL(9,6) NULL,
    walking_distance INT NULL,
    biking_distance INT NULL,
    driving_distance INT NULL,
    accommodation_type ENUM('on-campus', 'off-campus', 'partner_housing') NOT NULL,
    accommodation_capacity INT NOT NULL,
    tenant_restriction ENUM('male-only', 'female-only', 'coed') NOT NULL,
    application_start_date DATE NOT NULL,
    application_end_date DATE NOT NULL,
    CONSTRAINT accommodation_accommodation_id_pk PRIMARY KEY (accommodation_id),
    CONSTRAINT accommodation_accommodation_name_uk UNIQUE (accommodation_name),
    CONSTRAINT accommodation_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlord(user_id),
    CONSTRAINT accommodation_manager_id_fk FOREIGN KEY (manager_id) REFERENCES manager(user_id),
    CONSTRAINT accommodation_business_permit_id_fk FOREIGN KEY (business_permit_id) REFERENCES file_metadata(file_id),
    CONSTRAINT accommodation_landlord_id_uk UNIQUE (landlord_id),
    CONSTRAINT accommodation_manager_id_uk UNIQUE (manager_id),
    CONSTRAINT accommodation_business_permit_id_uk  UNIQUE (business_permit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ACCOMMODATION TAGS
CREATE TABLE IF NOT EXISTS accommodation_tags(
    tags_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    tag_detail VARCHAR(30) NOT NULL,
    CONSTRAINT accommodation_tags_tags_id_pk PRIMARY KEY (tags_id),
    CONSTRAINT accommodation_tags_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ACCOMMODATION IMAGES (set of images for each accommodation)
CREATE TABLE IF NOT EXISTS accommodation_images(
    images_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    image_file_id INT NOT NULL,
    CONSTRAINT accommodation_images_images_id_pk PRIMARY KEY (images_id),
    CONSTRAINT accommodation_images_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id),
    CONSTRAINT accommodation_images_image_file_id_fk FOREIGN KEY (image_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT accommodation_images_image_file_id_uk UNIQUE (image_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REVIEW
CREATE TABLE IF NOT EXISTS review(
    review_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    rating INT NOT NULL,
    content VARCHAR(500), -- optional 
    CONSTRAINT review_review_id_pk PRIMARY KEY (review_id),
    CONSTRAINT review_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER BOOKMARK (for accommodations)
CREATE TABLE IF NOT EXISTS bookmark(
    bookmark_id INT AUTO_INCREMENT,
    student_number VARCHAR(10) NOT NULL,
    accommodation_id INT NOT NULL,
    CONSTRAINT bookmark_bookmark_id_pk PRIMARY KEY (bookmark_id),
    CONSTRAINT bookmark_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number),
    CONSTRAINT bookmark_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROOM
CREATE TABLE IF NOT EXISTS room(
    room_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    room_number VARCHAR(5) NOT NULL,
    room_type ENUM('single', 'double', 'shared') NOT NULL,
    room_capacity INT NOT NULL,
    room_current_occupancy INT NOT NULL,
    room_building VARCHAR(20) NOT NULL,
    room_rent DECIMAL(10,2) NOT NULL,
    tenant_restriction ENUM('coed', 'non-coed') NOT NULL, -- if accommodation is coed, room can be coed or not
    room_availability ENUM('available', 'occupied', 'maintenance') NOT NULL,
    CONSTRAINT room_room_id_pk PRIMARY KEY (room_id),
    CONSTRAINT room_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TRANSIENT
CREATE TABLE IF NOT EXISTS transient(
    transient_id INT AUTO_INCREMENT,
    room_id INT NOT NULL,
    CONSTRAINT transient_transient_id_pk PRIMARY KEY (transient_id),
    CONSTRAINT transient_room_id_fk FOREIGN KEY (room_id) REFERENCES room(room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NON-TRANSIENT (for long term stay)
CREATE TABLE IF NOT EXISTS non_transient(
    non_transient_id INT AUTO_INCREMENT,
    room_id INT NOT NULL,
    CONSTRAINT non_transient_non_transient_id_pk PRIMARY KEY (non_transient_id),
    CONSTRAINT non_transient_room_id_fk FOREIGN KEY (room_id) REFERENCES room(room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- APPLICATION
CREATE TABLE IF NOT EXISTS application(
    application_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_room_type ENUM('single', 'double', 'shared') NOT NULL,
    application_stay_type ENUM('transient', 'non_transient') NOT NULL,
    application_status ENUM('pending', 'approved', 'rejected', 'cancelled', 'waitlisted', 'under_review') NOT NULL,
    duration_of_stay_days INT NOT NULL,
    CONSTRAINT application_application_id_pk PRIMARY KEY (application_id),
    CONSTRAINT application_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id),
    CONSTRAINT application_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ASSIGNMENT
CREATE TABLE IF NOT EXISTS assignment(
    assignment_id INT AUTO_INCREMENT,
    student_number VARCHAR(10) NOT NULL,
    room_id INT NOT NULL,
    move_in DATE NOT NULL,
    expected_move_out DATE NOT NULL,
    actual_move_out DATE NULL, -- can be NULL if student hasn't moved out
    grace_period_days INT NOT NULL DEFAULT 5, -- grace period to allow student to accept/reject assignments
    CONSTRAINT assignment_assignment_id_pk PRIMARY KEY (assignment_id),
    CONSTRAINT assignment_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number),
    CONSTRAINT assignment_room_id_fk FOREIGN KEY (room_id) REFERENCES room(room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REPORT
CREATE TABLE IF NOT EXISTS report(
    report_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    report_file_id INT NOT NULL,
    report_type ENUM('billing', 'assignment') NOT NULL,
    report_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_report_id_pk PRIMARY KEY (report_id),
    CONSTRAINT report_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlord(user_id),
    CONSTRAINT report_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number),
    CONSTRAINT report_report_file_id_fk FOREIGN KEY (report_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT report_report_file_id_uk UNIQUE (report_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FEE
CREATE TABLE IF NOT EXISTS fee(
    fee_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    due_date DATE NOT NULL,
    fee_category ENUM('rent', 'utilities', 'miscellaneous') NOT NULL,
    fee_amount DECIMAL(10, 2) NOT NULL,
    fee_balance DECIMAL(10, 2) NOT NULL,
    fee_status ENUM('paid', 'unpaid', 'overdue', 'partial') NOT NULL,
    CONSTRAINT fee_fee_id_pk PRIMARY KEY (fee_id),
    CONSTRAINT fee_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlord(user_id),
    CONSTRAINT fee_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAYMENT
CREATE TABLE IF NOT EXISTS payment(
    payment_id INT AUTO_INCREMENT,
    fee_id INT NOT NULL,
    proof_file_id INT NOT NULL,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10,2) NOT NULL,
    mode_of_payment VARCHAR(30) NOT NULL,
    CONSTRAINT payment_payment_id_pk PRIMARY KEY (payment_id),
    CONSTRAINT payment_fee_id_fk FOREIGN KEY (fee_id) REFERENCES fee(fee_id),
    CONSTRAINT payment_proof_file_id_fk FOREIGN KEY (proof_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT payment_proof_file_id_uk UNIQUE (proof_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LOG
CREATE TABLE IF NOT EXISTS log(
    log_id INT AUTO_INCREMENT,
    actor_id INT NULL,
    entity_type ENUM('application', 'assignment', 'payment', 'room', 'accommodation', 'document', 'report', 'fee') NOT NULL,
    entity_id INT NOT NULL, 
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activity_type VARCHAR(50) NOT NULL,
    activity_details VARCHAR(200),
    CONSTRAINT log_log_id_pk PRIMARY KEY (log_id),
    CONSTRAINT log_actor_id_fk FOREIGN KEY (actor_id) REFERENCES user(user_id),
    INDEX idx_entity (entity_type, entity_id) -- to ensure that the right entity is referenced (multiple entities may have the same ID, but of different entity types)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SYSTEM NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notification(
    notification_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_content TEXT NOT NULL,
    read_status ENUM('read', 'unread') DEFAULT 'unread',
    notification_type ENUM('fee_due', 'application_status', 'system', 'other') NOT NULL,
    notification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notification_notification_id_pk PRIMARY KEY (notification_id),
    CONSTRAINT notification_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SYSTEM VARIABLES (for backend stuff)
CREATE TABLE IF NOT EXISTS sys_variables(
    sys_id INT AUTO_INCREMENT,
    current_semester ENUM('first_sem', 'second_sem', 'midyear') NOT NULL,
    current_sy VARCHAR(9) NOT NULL, -- ex. 2024-2025
    sem_start_date DATE NOT NULL, -- beginning of current sem
    uplb_latitude DECIMAL(9,6) NOT NULL,
    uplb_longitude DECIMAL(9,6) NOT NULL,
    CONSTRAINT sys_variables_sys_id_pk PRIMARY KEY (sys_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEXES (for faster lookup)
-- USER Table Indexes
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_pfp_file_id ON user(pfp_file_id);

-- PHONE NUMBER Table Indexes
CREATE INDEX idx_phone_number_user_id ON phone_number(user_id);
CREATE INDEX idx_phone_number_contact_number ON phone_number(contact_number);

-- ACCOMMODATION Table Indexes
CREATE INDEX idx_accommodation_landlord_id ON accommodation(landlord_id);
CREATE INDEX idx_accommodation_manager_id ON accommodation(manager_id);
CREATE INDEX idx_accommodation_application_period ON accommodation(application_start_date, application_end_date);

-- ROOM Table Indexes
CREATE INDEX idx_room_accommodation_id ON room(accommodation_id);
CREATE INDEX idx_room_availability ON room(room_availability);

-- ASSIGNMENT Table Indexes
CREATE INDEX idx_assignment_student_number ON assignment(student_number);
CREATE INDEX idx_assignment_room_id ON assignment(room_id);

-- APPLICATION Table Indexes
CREATE INDEX idx_application_accommodation_id ON application(accommodation_id);
CREATE INDEX idx_application_student_number ON application(student_number);
CREATE INDEX idx_application_status ON application(application_status);

-- REPORT Table Indexes
CREATE INDEX idx_report_landlord_id ON report(landlord_id);
CREATE INDEX idx_report_student_number ON report(student_number);

-- FEE Table Indexes
CREATE INDEX idx_fee_landlord_id ON fee(landlord_id);
CREATE INDEX idx_fee_student_number ON fee(student_number);
CREATE INDEX idx_fee_status ON fee(fee_status);

-- PAYMENT Table Indexes
CREATE INDEX idx_payment_fee_id ON payment(fee_id);
CREATE INDEX idx_payment_proof_file_id ON payment(proof_file_id);

-- LOG Table Indexes
CREATE INDEX idx_log_actor_id ON log(actor_id);
CREATE INDEX idx_log_entity_type_entity_id ON log(entity_type, entity_id);

-- NOTIFICATION Table Indexes
CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_read_status ON notification(read_status);

-- SYSTEM VARIABLES Table Indexes
CREATE INDEX idx_sys_variables_current_semester ON sys_variables(current_semester);