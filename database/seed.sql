-- Entries per table

-- FILE META table (JP)

-- 1. USER table
INSERT INTO user 
    (pfp_file_id, fname, mname, lname, suffix, email, facebook_account, role) 
VALUES 
    (1, 'Juan', 'Santos', 'Dela Cruz', NULL, 'juan.delacruz@gmail.com', 'facebook.com/juan.delacruz', 'manager');
    (2, 'Louise Natasha', 'Valeria', 'Martinez', NULL, 'lvmartinez@up.edu.ph', 'facebook.com/luna.valeria', 'student');
    (3, 'Seven Manuel', 'Ladezma', 'Camero', 'Jr', 'slmanuel@up.edu.ph', 'facebook.com/seve.camero', 'student');
    (4, 'Avrielle Haven', 'Fernandez', 'Juarez', NULL, 'afjuarez@up.edu.ph', 'facebook.com/avie.juarez', 'student');
    (5, 'Larkin', 'Diaz', 'Sanchez', 'III', 'larkinsanchez@gmail.com', 'facebook.com/kino3.juarez', 'landlord');
    (6, 'Samantha Maureen', "Vera", 'Ramirez', NULL, 'svramirez@up.edu.ph', 'facebook.com/sam.ramirez', 'student');
    (7, 'Avianna Rye', "Castillo", 'Cruz', NULL, 'accruz@up.edu.ph', 'facebook.com/via.cruz', 'student');

-- 2. PHONE NUMBER
INSERT INTO phone_number 
    (user_id, contact_number, is_primary)
VALUES
    (1, '09171234567', 'true'),
    (2, '09625494265', 'true'),
    (3, '09123456789', 'true'),
    (1, '09686229361', 'false'),
    (2, '09182872048', 'false');

-- LANDLORD (jp)

-- MANAGER (jp)

-- 3. STUDENT
INSERT INTO student 
    (student_number, user_id, enrollment_proof_file_id, college, degree_program, gender, emergency_contact_name, emergency_contact_number)
VALUES 
    ('2023123456', 2, 1, 'CEAT', 'BS Industrial Engineering', 'Female', 'Kalix Martinez', '09181234567'),
    ('2023123457', 3, 2, 'CEAT', 'BS Civil Engineering', 'Male', 'Sebastian Cameroz', '09999159295'),
    ('2023123458', 4, 3, 'CEM', 'BS Economics', 'Female', 'Ashianna Fernandez', '09293230856'),
    ('2023123459', 6, 4, 'CAS', 'BA Communication Arts', 'Female', 'Clyden Ramirez', '09876543210'),
    ('2023123460', 7, 5, 'CEAT', 'BS Industrial Engineering', 'Female', NULL, NULL);

-- DOCUMENT (JP)

-- ACCOMODATION (JP)

-- ACCOMODATION TAGS (JP)

-- 4. REVIEW
INSERT INTO review 
    (accommodation_id, rating, content)
VALUES
    (1, 5, 'Clean rooms, responsive landlord, and very close to the university.'),
    (2, 3, 'Decent but the room is small.'),
    (3, 5, NULL),
    (4, 5, 'Clean rooms, responsive landlord, and very close to the university.'),
    (5, 1, 'Maintenance needs improvement.');

-- BOOKMARK (JP)

-- 5. ROOM
INSERT INTO room 
    (accommodation_id, room_number, room_type, room_capacity, room_current_occupancy, room_building, room_rent, tenant_restriction, room_availability)
VALUES
    (1, '101', 'single', 1, 0, 'Building A', 5000.00, 'coed', 'available'),
    (2, '102', 'double', 2, 1, 'Building A', 6500.00, 'coed', 'available'),
    (3, '201', 'shared', 4, 3, 'Building B', 4500.00, 'non-coed', 'occupied'),
    (4, '202', 'double', 2, 2, 'Building B', 7000.00, 'coed', 'occupied'),
    (5, '301', 'single', 1, 0, 'Building C', 5500.00, 'non-coed', 'maintenance');

-- 6. TRANSIENT
INSERT INTO transient 
    (room_id)
VALUES
    (1),
    (2),
    (3),
    (4),
    (5);

-- 7. NON-TRANSIENT
INSERT INTO non_transient 
    (room_id)
VALUES
    (6),
    (7),
    (8),
    (9),
    (10);

-- APPLICATION (JP)

-- ASSIGNMENT (JP)

-- 8. REPORT
INSERT INTO report 
    (landlord_id, student_number, report_file_id, report_type)
VALUES
    (1, '2023123456', 11, 'billing'),
    (2, '2023123457', 12, 'assignment'),
    (3, '2023123458', 13, 'billing'),
    (4, '2023123459', 14, 'assignment'),
    (5, '2023123460', 15, 'billing');

-- FEE (JP)

-- 9. PAYMENT
INSERT INTO payment 
    (fee_id, proof_file_id, payment_amount, mode_of_payment)
VALUES
    (1, 1, 5000.00, 'GCash'),
    (2, 2, 600.00, 'Bank Transfer'),
    (3, 3, 500.00, 'Cash'),
    (4, 4, 3000.00, 'GCash'),
    (5, 5, 1500.00, 'Online Banking');

-- LOG (JP)

-- 10. SYSTEM NOTIFICATIONS
INSERT INTO notification 
    (user_id, notification_content, read_status, notification_type)
VALUES
    (2, 'Your rent payment is due on March 15, 2026.', 'unread', 'fee_due'),
    (3, 'Your accommodation application has been approved.', 'read', 'application_status'),
    (4, 'System maintenance is scheduled on March 12, 2026.', 'unread', 'system'),
    (6, 'Please update your profile information.', 'read', 'other'),
    (7, 'Your utility fee is due tomorrow.', 'unread', 'fee_due');

-- 11. SYSTEM VARIABLES (FOR BACKEND STUFF)
INSERT INTO sys_variables 
    (current_semester, current_sy, sem_start_date)
VALUES
    ('first_sem', '2024-2025', '2024-08-20'),
    ('second_sem', '2024-2025', '2025-01-13'),
    ('midyear', '2024-2025', '2025-06-10'),
    ('first_sem', '2025-2026', '2025-08-19'),
    ('second_sem', '2025-2026', '2026-01-12');

