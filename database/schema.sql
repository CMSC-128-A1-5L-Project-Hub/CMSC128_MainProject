-- Database Schema for ALL entities

-- USER
CREATE TABLE IF NOT EXISTS user(
    user_id INT AUTO_INCREMENT,
    fname VARCHAR(50) NOT NULL,
    mname VARCHAR(50),
    lname VARCHAR(50) NOT NULL,
    suffix VARCHAR(10),
    email VARCHAR(75) NOT NULL,
    role ENUM('student', 'landlord', 'manager'),
    CONSTRAINT user_user_id_pk PRIMARY KEY (user_id),
    CONSTRAINT user_email_uk UNIQUE (email)
);

-- LANDLORD
CREATE TABLE IF NOT EXISTS landlord(
    user_id INT NOT NULL,
    CONSTRAINT landlord_user_id_pk PRIMARY (user_id) REFERENCES user(user_id),
    CONSTRAINT landlord_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- MANAGER
CREATE TABLE IF NOT EXISTS manager(
    user_id INT NOT NULL,
    CONSTRAINT manager_user_id_pk PRIMARY (user_id) REFERENCES user(user_id),
    CONSTRAINT manager_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- STUDENT
CREATE TABLE IF NOT EXISTS student(
    student_number VARCHAR(10) NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT student_student_number_pk PRIMARY KEY (student_number),
    CONSTRAINT student_user_id_fk FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- ACCOMMODATION
CREATE TABLE IF NOT EXISTS accommodation(
    accommodation_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    manager_id INT NOT NULL,
    accommodation_name VARCHAR(50) NOT NULL,
    accommodation_location VARCHAR(150) NOT NULL,
    accommodation_type ENUM('on-campus', 'off-campus', 'partner_housing') NOT NULL,
    accommodation_capacity INT NOT NULL,
    CONSTRAINT accommodation_accommodation_id_pk PRIMARY KEY (accommodation_id),
    CONSTRAINT accommodation_accommodation_name_uk UNIQUE (accommodation_name),
    CONSTRAINT accommodation_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlord(user_id),
    CONSTRAINT accommodation_manager_id_fk FOREIGN KEY (manager_id) REFERENCES manager(user_id)
);

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
    room_availability ENUM('available', 'occupied', 'maintenance') NOT NULL,
    CONSTRAINT room_room_id_pk PRIMARY KEY (room_id),
    CONSTRAINT room_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id)
);

-- APPLICATION
CREATE TABLE IF NOT EXISTS application(
    application_id INT AUTO_INCREMENT,
    accommodation_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_room_type ENUM('single', 'double', 'shared') NOT NULL,
    application_status ENUM('pending', 'approved', 'rejected', 'cancelled', 'waitlisted', 'under_review') NOT NULL,
    duration_of_stay_days INT NOT NULL,
    CONSTRAINT application_application_id_pk PRIMARY KEY (application_id),
    CONSTRAINT application_accommodation_id_fk FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id),
    CONSTRAINT application_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number)
);

-- DOCUMENT
CREATE TABLE IF NOT EXISTS document(
    document_id INT AUTO_INCREMENT,
    application_id INT NOT NULL,
    document_name VARCHAR(50) NOT NULL,
    document_file MEDIUMBLOB NOT NULL,
    CONSTRAINT document_document_id_pk PRIMARY KEY (document_id),
    CONSTRAINT document_application_id_fk FOREIGN KEY (application_id) REFERENCES application(application_id)
);

-- ASSIGNMENT
CREATE TABLE IF NOT EXISTS assignment(
    assignment_id INT AUTO_INCREMENT,
    student_number VARCHAR(10) NOT NULL,
    room_id INT NOT NULL,
    move_in DATE NOT NULL,
    expected_move_out DATE NOT NULL,
    actual_move_out DATE NULL,
    CONSTRAINT assignment_assignment_id_pk PRIMARY KEY (assignment_id),
    CONSTRAINT assignment_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number),
    CONSTRAINT assignment_room_id_fk FOREIGN KEY (room_id) REFERENCES room(room_id)
);

-- REPORT
CREATE TABLE IF NOT EXISTS report(
    report_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    report_type ENUM('billing', 'assignment') NOT NULL,
    report_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_file MEDIUMBLOB NOT NULL,
    CONSTRAINT report_report_id_pk PRIMARY KEY (report_id),
    CONSTRAINT report_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlord(user_id),
    CONSTRAINT report_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number)
);

-- FEE
CREATE TABLE IF NOT EXISTS fee(
    fee_id INT AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    student_number VARCHAR(10) NOT NULL,
    due_date DATE NOT NULL,
    fee_category ENUM('rent', 'utilities', 'miscellaneous') NOT NULL,
    fee_amount DECIMAL(10, 2) NOT NULL,
    fee_status ENUM('paid', 'unpaid', 'overdue', 'partial') NOT NULL,
    CONSTRAINT fee_fee_id_pk PRIMARY KEY (fee_id),
    CONSTRAINT fee_landlord_id_fk FOREIGN KEY (landlord_id) REFERENCES landlord(user_id),
    CONSTRAINT fee_student_number_fk FOREIGN KEY (student_number) REFERENCES student(student_number)
);

-- PAYMENT
CREATE TABLE IF NOT EXISTS payment(
    payment_id INT AUTO_INCREMENT,
    fee_id INT NOT NULL,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10,2) NOT NULL,
    mode_of_payment VARCHAR(30) NOT NULL,
    CONSTRAINT payment_payment_id_pk PRIMARY KEY (payment_id),
    CONSTRAINT payment_fee_id_fk FOREIGN KEY (fee_id) REFERENCES fee(fee_id)
);

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
    INDEX idx_entity (entity_type, entity_id)
);