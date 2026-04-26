-- =============================================================================
-- 1. FILE METADATA (required for foreign keys)
-- =============================================================================
INSERT INTO file_metadata (file_name, file_path, file_type) VALUES
('placeholder_permit.pdf', '/uploads/documents/placeholder_permit.pdf', 'document'), -- id 1
('enrollment_proof.pdf', '/uploads/documents/enrollment_proof.pdf', 'document'),    -- id 2
('dorm_image_1.jpg', '/uploads/images/dorm_1.jpg', 'image'),                        -- id 3
('dorm_image_2.jpg', '/uploads/images/dorm_2.jpg', 'image');                        -- id 4

-- =============================================================================
-- 2. USERS
-- =============================================================================
INSERT INTO users (id, email, fname, lname, role, account_status) VALUES
(1, 'testlandlord@gmail.com', 'Land', 'Lord', 'landlord', 'active'),
(2, 'yuuhhhmimi@gmail.com', 'Mimi', 'Yuuhhh', 'manager', 'active'),
(3, 'teststudent@up.edu.ph', 'Student', 'One', 'student', 'active');

-- =============================================================================
-- 3. PHONE NUMBERS
-- =============================================================================
INSERT INTO phone_numbers (user_id, contact_number, is_primary) VALUES
(1, '09171234567', true),
(2, '09987654321', true),
(3, '09281234567', true);

-- =============================================================================
-- 4. LANDLORD / MANAGER / STUDENT
-- =============================================================================
INSERT INTO landlords (user_id, tin) VALUES (1, '123-456-789-000');
INSERT INTO managers (user_id, manager_status) VALUES (2, 'active');
INSERT INTO students (student_number, user_id, enrollment_proof_file_id, college, degree_program, gender, year_level)
VALUES ('2023-00001', 3, 2, 'CAS', 'BS Computer Science', 'Female', '3rd Year');

-- =============================================================================
-- 5. ACCOMMODATION (belongs to landlord 1, managed by manager 2)
-- =============================================================================
INSERT INTO accommodations (id, landlord_id, manager_id, business_permit_id, accommodation_name,
    accommodation_location, accommodation_type, accommodation_capacity, tenant_restriction,
    status, latitude, longitude, walking_distance, biking_distance, driving_distance, primary_image_index)
VALUES (1, 1, 2, 1, 'Test Dorm', '123 Main St, Los Baños', 'off-campus', 50, 'coed',
    'verified', 14.1650, 121.2400, 5, 3, 2, 0);

-- Accommodation tags
INSERT INTO accommodation_tags (accommodation_id, tag_detail) VALUES
(1, 'Near campus'), (1, 'Pet friendly');

-- Accommodation images (link to file_metadata ids 3 and 4)
INSERT INTO accommodation_images (accommodation_id, image_file_id) VALUES
(1, 3), (1, 4);

-- =============================================================================
-- 6. ROOMS
-- =============================================================================
INSERT INTO rooms (accommodation_id, room_number, room_type, room_stay_type, room_capacity,
    room_current_occupancy, room_building, room_rent, tenant_restriction, room_availability)
VALUES
(1, '101', 'single', 'transient', 1, 0, 'Building A', 5000.00, 'coed', 'available'),
(1, '102', 'double', 'non_transient', 2, 0, 'Building A', 6500.00, 'coed', 'available'),
(1, '201', 'shared', 'non_transient', 4, 1, 'Building B', 3200.00, 'coed', 'occupied');

-- =============================================================================
-- 7. APPLICATIONS (student 2023-00001 applying to accommodation 1)
-- =============================================================================
INSERT INTO applications (id, accommodation_id, student_number, application_room_type,
    application_stay_type, application_status, duration_of_stay_days)
VALUES
-- pending application
(1, 1, '2023-00001', 'single', 'transient', 'pending', 30),
-- approved application (will later get an assignment)
(2, 1, '2023-00001', 'double', 'non_transient', 'approved', 180),
-- waitlisted application (to test the waitlist)
(3, 1, '2023-00001', 'shared', 'non_transient', 'waitlisted', 365);

-- =============================================================================
-- 8. ASSIGNMENTS (assign the approved application to room 201, which is occupied now)
-- =============================================================================
-- First, update room 201 occupancy to 1 (already done above)
INSERT INTO assignments (id, student_number, room_id, confirmed_date, move_in, expected_move_out, actual_move_out, grace_period_days)
VALUES (1, '2023-00001', 3, '2026-03-01', '2026-03-01', '2026-09-01', NULL, 5);

-- =============================================================================
-- 9. ACTIVITY LOGS (optional, to test logs)
-- =============================================================================
INSERT INTO logs (actor_id, entity_type, entity_id, activity_type, activity_details)
VALUES (2, 'accommodation', 1, 'update', 'Updated room capacity');

-- =============================================================================
-- 10. SYSTEM VARIABLES (needed for distance calculation in some places)
-- =============================================================================
INSERT INTO sys_variables (current_semester, current_sy, sem_start_date, uplb_latitude, uplb_longitude)
VALUES ('second_sem', '2025-2026', '2026-01-12', 14.1651, 121.2402);