-- Database Schema for ALL entities

 -- FILE METADATA
 -- for easier tracking of files
CREATE TABLE IF NOT EXISTS file_metadata(
    file_id INT AUTO_INCREMENT,
    file_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('document', 'image') NOT NULL,
    CONSTRAINT file_metadata_file_id_pk PRIMARY KEY (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- USER
-- For easier authentication, role-based tables are to reference the user_id instead
CREATE TABLE IF NOT EXISTS users(
    user_id INT AUTO_INCREMENT,
    pfp_file_id INT NOT NULL, -- profile metadata
    fname VARCHAR(50) NOT NULL,
    mname VARCHAR(50),
    lname VARCHAR(50) NOT NULL,
    suffix VARCHAR(10),
    email VARCHAR(75) NOT NULL,
    facebook_account VARCHAR(100) NULL,
    role ENUM('student', 'landlord', 'manager', 'unassigned', 'super_admin') NOT NULL DEFAULT 'unassigned',
    CONSTRAINT user_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT user_email_uk UNIQUE (email),
    CONSTRAINT user_pfp_file_id_fk FOREIGN KEY (pfp_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT user_pfp_file_id_uk UNIQUE (pfp_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- PHONE NUMBER
CREATE TABLE IF NOT EXISTS phone_numbers(
    phone_number_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    contact_number VARCHAR(11) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- determine if phone number is the user's primary phone number
    CONSTRAINT phone_number_phone_number_id_pk PRIMARY KEY (phone_number_id),
    CONSTRAINT phone_number_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT phone_number_contact_number_uk UNIQUE (contact_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- LANDLORD
CREATE TABLE IF NOT EXISTS landlords(
    user_id INT NOT NULL,
    tin VARCHAR(15) NOT NULL, -- tax identification number
    CONSTRAINT landlord_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT landlord_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- MANAGER
CREATE TABLE IF NOT EXISTS managers(
    user_id INT NOT NULL,
    manager_status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive',
    CONSTRAINT manager_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT manager_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- STUDENT
CREATE TABLE IF NOT EXISTS students(
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
    CONSTRAINT student_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT student_enrollment_proof_file_id_fk FOREIGN KEY (enrollment_proof_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT student_user_id_uk UNIQUE (user_id),
    CONSTRAINT student_enrollment_proof_file_id_uk UNIQUE (enrollment_proof_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- DOCUMENT
CREATE TABLE IF NOT EXISTS documents(
    document_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT document_document_id_pk PRIMARY KEY (document_id),
    CONSTRAINT document_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT document_file_id_fk FOREIGN KEY (file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT document_file_id_uk UNIQUE (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- ACCOMMODATION
CREATE TABLE IF NOT EXISTS accommodations(
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
    CONSTRAINT accommodation_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlords(user_id),
    CONSTRAINT accommodation_manager_id_fk FOREIGN KEY (manager_id) REFERENCES managers(user_id),
    CONSTRAINT accommodation_business_permit_id_fk FOREIGN KEY (business_permit_id) REFERENCES file_metadata(file_id),
    CONSTRAINT accommodation_manager_id_uk UNIQUE (manager_id),
    CONSTRAINT accommodation_business_permit_id_uk  UNIQUE (business_permit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- ACCOMMODATION TAGS
CREATE TABLE IF NOT EXISTS accommodation_tags(
    tags_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    tag_detail VARCHAR(30) NOT NULL,
    CONSTRAINT accommodation_tags_tags_id_pk PRIMARY KEY (tags_id),
    CONSTRAINT accommodation_tags_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- ACCOMMODATION IMAGES (set of images for each accommodation)
CREATE TABLE IF NOT EXISTS accommodation_images(
    images_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    image_file_id INT NOT NULL,
    CONSTRAINT accommodation_images_images_id_pk PRIMARY KEY (images_id),
    CONSTRAINT accommodation_images_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id),
    CONSTRAINT accommodation_images_image_file_id_fk FOREIGN KEY (image_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT accommodation_images_image_file_id_uk UNIQUE (image_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- REVIEW
CREATE TABLE IF NOT EXISTS reviews(
    review_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    rating INT NOT NULL,
    content VARCHAR(500), -- optional 
    CONSTRAINT review_review_id_pk PRIMARY KEY (review_id),
    CONSTRAINT review_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- USER BOOKMARK (for accommodations)
CREATE TABLE IF NOT EXISTS bookmarks(
    bookmark_id INT AUTO_INCREMENT,
    student_number VARCHAR(10) NOT NULL,
    accommodation_id INT NOT NULL,
    CONSTRAINT bookmark_bookmark_id_pk PRIMARY KEY (bookmark_id),
    CONSTRAINT bookmark_student_number_fk FOREIGN KEY (student_number) REFERENCES students(student_number),
    CONSTRAINT bookmark_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- ROOM
CREATE TABLE IF NOT EXISTS rooms(
    room_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    room_number VARCHAR(5) NOT NULL,
    room_type ENUM('single', 'double', 'shared') NOT NULL,
    room_stay_type ENUM('transient', 'non_transient') NOT NULL,
    room_capacity INT NOT NULL,
    room_current_occupancy INT NOT NULL,
    room_building VARCHAR(20) NOT NULL,
    room_rent DECIMAL(10,2) NOT NULL,
    tenant_restriction ENUM('coed', 'non-coed') NOT NULL, -- if accommodation is coed, room can be coed or not
    room_availability ENUM('available', 'occupied', 'maintenance') NOT NULL,
    CONSTRAINT room_room_id_pk PRIMARY KEY (room_id),
    CONSTRAINT room_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- APPLICATION
CREATE TABLE IF NOT EXISTS applications(
    application_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_room_type ENUM('single', 'double', 'shared') NOT NULL,
    application_stay_type ENUM('transient', 'non_transient') NOT NULL,
    application_status ENUM('pending', 'approved', 'rejected', 'cancelled', 'waitlisted', 'under_review') NOT NULL,
    rejection_reason VARCHAR(200) NOT NULL,
    duration_of_stay_days INT NOT NULL,
    CONSTRAINT application_application_id_pk PRIMARY KEY (application_id),
    CONSTRAINT application_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id),
    CONSTRAINT application_student_number_fk FOREIGN KEY (student_number) REFERENCES students(student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- ASSIGNMENT
CREATE TABLE IF NOT EXISTS assignments(
    assignment_id INT AUTO_INCREMENT,
    student_number VARCHAR(10) NOT NULL,
    room_id INT NOT NULL,
    move_in DATE NOT NULL,
    expected_move_out DATE NOT NULL,
    actual_move_out DATE NULL, -- can be NULL if student hasn't moved out
    grace_period_days INT NOT NULL DEFAULT 5, -- grace period to allow student to accept/reject assignments
    CONSTRAINT assignment_assignment_id_pk PRIMARY KEY (assignment_id),
    CONSTRAINT assignment_student_number_fk FOREIGN KEY (student_number) REFERENCES students(student_number),
    CONSTRAINT assignment_room_id_fk FOREIGN KEY (room_id) REFERENCES rooms(room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- REPORT
CREATE TABLE IF NOT EXISTS reports(
    report_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    report_file_id INT NOT NULL,
    report_type ENUM('billing', 'assignment') NOT NULL,
    report_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_report_id_pk PRIMARY KEY (report_id),
    CONSTRAINT report_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlords(user_id),
    CONSTRAINT report_student_number_fk FOREIGN KEY (student_number) REFERENCES students(student_number),
    CONSTRAINT report_report_file_id_fk FOREIGN KEY (report_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT report_report_file_id_uk UNIQUE (report_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- FEE
CREATE TABLE IF NOT EXISTS fees(
    fee_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    due_date DATE NOT NULL,
    fee_category ENUM('rent', 'utilities', 'miscellaneous') NOT NULL,
    fee_amount DECIMAL(10, 2) NOT NULL,
    fee_balance DECIMAL(10, 2) NOT NULL,
    fee_status ENUM('paid', 'unpaid', 'overdue', 'partial') NOT NULL,
    CONSTRAINT fee_fee_id_pk PRIMARY KEY (fee_id),
    CONSTRAINT fee_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlords(user_id),
    CONSTRAINT fee_student_number_fk FOREIGN KEY (student_number) REFERENCES students(student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- PAYMENT
CREATE TABLE IF NOT EXISTS payments(
    payment_id INT AUTO_INCREMENT,
    fee_id INT NOT NULL,
    proof_file_id INT NOT NULL,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10,2) NOT NULL,
    mode_of_payment VARCHAR(30) NOT NULL,
    CONSTRAINT payment_payment_id_pk PRIMARY KEY (payment_id),
    CONSTRAINT payment_fee_id_fk FOREIGN KEY (fee_id) REFERENCES fees(fee_id),
    CONSTRAINT payment_proof_file_id_fk FOREIGN KEY (proof_file_id) REFERENCES file_metadata(file_id),
    CONSTRAINT payment_proof_file_id_uk UNIQUE (proof_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- LOG
CREATE TABLE IF NOT EXISTS logs(
    log_id INT AUTO_INCREMENT,
    actor_id INT NULL,
    entity_type ENUM('application', 'assignment', 'payment', 'room', 'accommodation', 'document', 'report', 'fee') NOT NULL,
    entity_id INT NOT NULL, 
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activity_type VARCHAR(50) NOT NULL,
    activity_details VARCHAR(200),
    CONSTRAINT log_log_id_pk PRIMARY KEY (log_id),
    CONSTRAINT log_actor_id_fk FOREIGN KEY (actor_id) REFERENCES users(user_id),
    INDEX idx_entity (entity_type, entity_id) -- to ensure that the right entity is referenced (multiple entities may have the same ID, but of different entity types)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- SYSTEM NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications(
    notification_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_content TEXT NOT NULL,
    read_status ENUM('read', 'unread') DEFAULT 'unread',
    notification_type ENUM('fee_due', 'application_status', 'system', 'other') NOT NULL,
    notification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notification_notification_id_pk PRIMARY KEY (notification_id),
    CONSTRAINT notification_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- SYSTEM VARIABLES (for backend stuff)
CREATE TABLE IF NOT EXISTS sys_variables(
    sys_id INT AUTO_INCREMENT,
    current_semester ENUM('first_sem', 'second_sem', 'midyear') NOT NULL,
    current_sy VARCHAR(9) NOT NULL, -- ex. 2024-2025
    sem_start_date DATE NOT NULL, -- beginning of current sem
    uplb_latitude DECIMAL(9,6) NOT NULL,
    uplb_longitude DECIMAL(9,6) NOT NULL,
    CONSTRAINT sys_variables_sys_id_pk PRIMARY KEY (sys_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
AUTO_INCREMENT = 1;

-- INDEXES (for faster lookup)
-- USERS Table Indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_pfp_file_id ON users(pfp_file_id);

-- PHONE NUMBERS Table Indexes
CREATE INDEX idx_phone_number_user_id ON phone_numbers(user_id);
CREATE INDEX idx_phone_number_contact_number ON phone_numbers(contact_number);

-- ACCOMMODATIONS Table Indexes
CREATE INDEX idx_accommodation_landlord_id ON accommodations(landlord_id);
CREATE INDEX idx_accommodation_manager_id ON accommodations(manager_id);
CREATE INDEX idx_accommodation_application_period ON accommodations(application_start_date, application_end_date);

-- ACCOMMODATION TAGS Table Indexes
CREATE INDEX idx_accommodation_tags_detail_accom ON accommodation_tags(tag_detail, accommodation_id);

-- REVIEWS Table Indexes
CREATE INDEX idx_reviews_accommodation_rating ON reviews(accommodation_id, rating);

-- BOOKMARKS Table Indexes
CREATE INDEX idx_bookmarks_student_accommodation ON bookmarks(student_number, accommodation_id);

-- ROOMS Table Indexes
CREATE INDEX idx_room_accommodation_id ON rooms(accommodation_id);
CREATE INDEX idx_room_availability ON rooms(room_availability);
CREATE INDEX idx_room_type ON rooms(room_type);
CREATE INDEX idx_room_stay_type ON rooms(room_stay_type);

-- ASSIGNMENTS Table Indexes
CREATE INDEX idx_assignment_student_number ON assignments(student_number);
CREATE INDEX idx_assignment_room_id ON assignments(room_id);

-- APPLICATIONS Table Indexes
CREATE INDEX idx_application_accommodation_id ON applications(accommodation_id);
CREATE INDEX idx_application_student_number ON applications(student_number);
CREATE INDEX idx_application_status ON applications(application_status);

-- REPORTS Table Indexes
CREATE INDEX idx_report_landlord_id ON reports(landlord_id);
CREATE INDEX idx_report_student_number ON reports(student_number);

-- FEES Table Indexes
CREATE INDEX idx_fee_landlord_id ON fees(landlord_id);
CREATE INDEX idx_fee_student_number ON fees(student_number);
CREATE INDEX idx_fee_status ON fees(fee_status);

-- PAYMENTS Table Indexes
CREATE INDEX idx_payment_fee_id ON payments(fee_id);
CREATE INDEX idx_payment_proof_file_id ON payments(proof_file_id);

-- LOGS Table Indexes
CREATE INDEX idx_log_actor_id ON logs(actor_id);
CREATE INDEX idx_log_entity_type_entity_id ON logs(entity_type, entity_id);

-- NOTIFICATIONS Table Indexes
CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_read_status ON notifications(read_status);

-- SYSTEM VARIABLES Table Indexes
CREATE INDEX idx_sys_variables_current_semester ON sys_variables(current_semester);