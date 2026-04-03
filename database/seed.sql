-- Entries per table

-- 1. FILE METADATA
INSERT INTO file_metadata
    (file_name, file_path, file_type)
VALUES
-- 17 profile images for users (user_id 1–17)
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),
('default_pfp.jpg', '/defaults/default_pfp.jpg', 'image'),

-- 7 enrollment proof documents for students
('enroll_2023123456.pdf', '/documents/enroll_2023123456.pdf', 'document'),
('enroll_2023123457.pdf', '/documents/enroll_2023123457.pdf', 'document'),
('enroll_2023123458.pdf', '/documents/enroll_2023123458.pdf', 'document'),
('enroll_2023123459.pdf', '/documents/enroll_2023123459.pdf', 'document'),
('enroll_2023123460.pdf', '/documents/enroll_2023123460.pdf', 'document'),
('enroll_2023123461.pdf', '/documents/enroll_2023123461.pdf', 'document'),
('enroll_2023123462.pdf', '/documents/enroll_2023123462.pdf', 'document'),

-- 5 report files
('report_1.pdf', '/reports/report_1.pdf', 'document'),
('report_2.pdf', '/reports/report_2.pdf', 'document'),
('report_3.pdf', '/reports/report_3.pdf', 'document'),
('report_4.pdf', '/reports/report_4.pdf', 'document'),
('report_5.pdf', '/reports/report_5.pdf', 'document'),

-- 6 business permit files
('business_permit_1.pdf', '/accommodations/permits/business_permit_1.pdf', 'document'),
('business_permit_2.pdf', '/accommodations/permits/business_permit_2.pdf', 'document'),
('business_permit_3.pdf', '/accommodations/permits/business_permit_3.pdf', 'document'),
('business_permit_4.pdf', '/accommodations/permits/business_permit_4.pdf', 'document'),
('business_permit_5.pdf', '/accommodations/permits/business_permit_5.pdf', 'document'),
('business_permit_6.pdf', '/accommodations/permits/business_permit_6.pdf', 'document'),

-- 12 accommodation images (2 per accommodation_id 1–6)
('accom1_img1.jpg', '/accommodations/images/accom1_img1.jpg', 'image'),
('accom1_img2.jpg', '/accommodations/images/accom1_img2.jpg', 'image'),
('accom2_img1.jpg', '/accommodations/images/accom2_img1.jpg', 'image'),
('accom2_img2.jpg', '/accommodations/images/accom2_img2.jpg', 'image'),
('accom3_img1.jpg', '/accommodations/images/accom3_img1.jpg', 'image'),
('accom3_img2.jpg', '/accommodations/images/accom3_img2.jpg', 'image'),
('accom4_img1.jpg', '/accommodations/images/accom4_img1.jpg', 'image'),
('accom4_img2.jpg', '/accommodations/images/accom4_img2.jpg', 'image'),
('accom5_img1.jpg', '/accommodations/images/accom5_img1.jpg', 'image'),
('accom5_img2.jpg', '/accommodations/images/accom5_img2.jpg', 'image'),
('accom6_img1.jpg', '/accommodations/images/accom6_img1.jpg', 'image'),
('accom6_img2.jpg', '/accommodations/images/accom6_img2.jpg', 'image'),

-- 3 payment images
('payment_1.jpg', '/payments/payment_1.jpg', 'image'),
('payment_2.jpg', '/payments/payment_2.jpg', 'image'),
('payment_3.jpg', '/payments/payment_3.jpg', 'image'),

-- 5 other document images
('doc_img_1.jpg', '/documents/doc_1.pdf', 'document'),
('doc_img_2.jpg', '/documents/doc_2.pdf', 'document'),
('doc_img_3.jpg', '/documents/doc_3.pdf', 'document'),
('doc_img_4.jpg', '/documents/doc_4.pdf', 'document'),
('doc_img_5.jpg', '/documents/doc_5.pdf', 'document');

-- 2. USER table
INSERT INTO users 
    (pfp_file_id, fname, mname, lname, suffix, email, facebook_account, role) 
VALUES 
    -- Students (7)
    (1, 'Louise Natasha', 'Valeria', 'Martinez', NULL, 'lvmartinez@up.edu.ph', 'facebook.com/luna.valeria', 'student'),
    (2, 'Avrielle Haven', 'Fernandez', 'Juarez', NULL, 'afjuarez@up.edu.ph', 'facebook.com/avie.juarez', 'student'),
    (3, 'Samantha Maureen', 'Vera', 'Ramirez', NULL, 'svramirez@up.edu.ph', 'facebook.com/sam.ramirez', 'student'),
    (4, 'Avianna Rye', 'Castillo', 'Cruz', NULL, 'accruz@up.edu.ph', 'facebook.com/via.cruz', 'student'),
    (5, 'Daniel Joseph', 'Flores', 'Santos', NULL, 'djsantos@up.edu.ph', 'facebook.com/daniel.santos', 'student'),
    (6, 'Kristine Joy', 'Mendoza', 'Villanueva', NULL, 'kjvillanueva@up.edu.ph', 'facebook.com/kristine.villanueva', 'student'),
    (7, 'Joshua Daniel', 'Castro', 'Aguilar', NULL, 'jdaguilar@up.edu.ph', 'facebook.com/joshua.aguilar', 'student'),

    -- Landlords (5)
    (8, 'Larkin', 'Diaz', 'Sanchez', 'III', 'larkinsanchez@gmail.com', 'facebook.com/kino3.juarez', 'landlord'),
    (9, 'Carlos Miguel', 'Reyes', 'Navarro', NULL, 'cmnavarro@gmail.com', 'facebook.com/carlos.navarro', 'landlord'),
    (10, 'Patricia Anne', 'Lopez', 'Garcia', NULL, 'pagarcia@up.edu.ph', 'facebook.com/patricia.garcia', 'landlord'),
    (11, 'Rafael Antonio', 'Gutierrez', 'Ortega', 'Jr', 'raortega@gmail.com', 'facebook.com/rafael.ortega', 'landlord'),
    (12, 'Nicole Therese', 'Domingo', 'Ramos', NULL, 'ntramos@gmail.com', 'facebook.com/nicole.ramos', 'landlord'),

    -- Managers (6)
    (13, 'Juan', 'Santos', 'Dela Cruz', NULL, 'juan.delacruz@gmail.com', 'facebook.com/juan.delacruz', 'manager'),
    (14, 'Seven Manuel', 'Ladezma', 'Camero', 'Jr', 'slmanuel@up.edu.ph', 'facebook.com/seve.camero', 'manager'),
    (15, 'Michael Angelo', 'Torres', 'Bautista', NULL, 'mabautista@gmail.com', 'facebook.com/michael.bautista', 'manager'),
    (16, 'Angela Marie', 'Salazar', 'Pineda', NULL, 'ampineda@up.edu.ph', 'facebook.com/angela.pineda', 'manager'),
    (17, 'Victor Emmanuel', 'Alvarez', 'Padilla', NULL, 'vepadilla@gmail.com', 'facebook.com/victor.padilla', 'manager'),
    (18, 'Andy Emmanuel', 'Padilla', 'Alvarez', NULL, 'aralvarez@gmail.com', 'facebook.com/andy.alvarez', 'manager');

-- 3. PHONE NUMBER
INSERT INTO phone_numbers 
    (user_id, contact_number, is_primary)
VALUES
    (1, '09171234567', TRUE),
    (2, '09625494265', TRUE),
    (3, '09123456789', TRUE),
    (4, '09175678321', TRUE),
    (5, '09681234567', TRUE),
    (6, '09751239876', TRUE),
    (7, '09182345678', TRUE),
    (8, '09913456721', TRUE),
    (9, '09674561234', TRUE),
    (10, '09196783421', TRUE),
    (11, '09872345611', TRUE),
    (12, '09784561239', TRUE),
    (13, '09165478322', TRUE),
    (14, '09987654321', TRUE),
    (15, '09686229361', TRUE),
    (16, '09182872048', TRUE),
    (17, '09194561234', TRUE),
    (18, '09174562318', TRUE),
    (7, '09682345761', FALSE),
    (14, '09916543287', FALSE),
    (16, '09185673429', FALSE),
    (17, '09793456128', FALSE);

-- 4. LANDLORD
INSERT INTO landlords
    (user_id, tin)
VALUES
    (8, '123-456-789-000'),
    (9, '234-567-890-111'),
    (10, '345-678-901-222'),
    (11, '456-789-012-333'),
    (12, '567-890-123-444');

-- 5. MANAGER
INSERT INTO managers
    (user_id, manager_status)
VALUES
    (13, 'active'),
    (14, 'active'),
    (15, 'active'),
    (16, 'inactive'),
    (17, 'active'),
    (18, 'active');

-- 6. STUDENT
INSERT INTO students 
    (student_number, user_id, enrollment_proof_file_id, course, college, gender, emergency_contact_name, emergency_contact_number)
VALUES 
    ('2023123456', 1, 18, 'BS Industrial Engineering', 'CEAT', 'Female', 'Kalix Martinez', '09181234567'),
    ('2023123457', 2, 19, 'BS Civil Engineering', 'CEAT', 'Female', 'Sebastian Cameroz', '09999159295'),
    ('2023123458', 3, 20, 'BS Economics', 'CEM', 'Female', 'Ashianna Fernandez', '09293230856'),
    ('2023123459', 4, 21, 'BA Communication Arts', 'CAS', 'Female', 'Clyden Ramirez', '09876543210'),
    ('2023123460', 5, 22, 'BS Industrial Engineering', 'CEAT', 'Male', NULL, NULL),
    ('2023123461', 6, 23, 'BS Accountancy', 'CEM','Female', 'Rafael Ortega', '09172345678'),
    ('2023123462', 7, 24, 'BS Computer Science', 'CAS', 'Male', 'Victor Padilla', '09987654321');

-- 7. DOCUMENTS
INSERT INTO documents
    (user_id, file_id, upload_timestamp)
VALUES
    (2, 51, '2026-03-01 09:15:00'),
    (3, 52, '2026-03-02 14:30:00'),
    (4, 53, '2026-03-03 11:45:00'),
    (5, 54, '2026-03-04 16:20:00'),
    (6, 55, '2026-03-05 08:05:00');

-- 8. REPORT
INSERT INTO reports 
    (landlord_id, student_number, file_id, type)
VALUES
    (12, '2023123456', 25, 'billing'),
    (9, '2023123457', 26, 'assignment'),
    (8, '2023123459', 27, 'billing'),
    (8, '2023123461', 28, 'assignment'),
    (11, '2023123462', 29, 'billing');

-- 9. ACCOMODATION
INSERT INTO accommodations 
    (landlord_id, manager_id, business_permit_id, name, location, type, capacity, tenant_restriction, application_start_date, application_end_date)
VALUES
    (8, 13, 30, 'White House', 'Ruby St., Brgy. Batong Malake, Los Baños, Laguna', 'off-campus', 60, 'coed', '2026-04-01', '2026-05-15'),
    (9, 14, 31, 'One Silangan', 'UPLB, Los Baños, Laguna', 'on-campus', 40, 'coed', '2026-04-01', '2026-05-20'),
    (10, 15, 32, "Men's Dorm", 'UPLB, Los Baños, Laguna', 'partner_housing', 150, 'male-only', '2026-03-20', '2026-04-30'),
    (11, 16, 33, "ATI", 'UPLB, Los Baños, Laguna', 'partner_housing', 120, 'male-only', '2026-04-05', '2026-05-25'),
    (8, 17, 34, "Scholar's Dorm", 'UPLB, Los Baños, Laguna', 'on-campus', 50, 'female-only', '2026-03-25', '2026-05-10'),
    (12, 18, 35, "One Sapphire Place", 'Sapphire St., Brgy. Batong Malake, Los Baños, Laguna', 'off-campus', 50, 'coed', '2026-03-25', '2026-05-10');

-- 10. ACCOMODATION TAGS
INSERT INTO accommodation_tags 
    (accommodation_id, tag_detail)
VALUES
    (1, 'Near campus'),
    (1, 'Pet friendly'),

    (2, 'Near Establishments'),
    (2, 'Air-conditioned rooms'),

    (3, 'Has study area'),
    (3, '24/7 Security'),

    (4, 'Has study area'),
    (4, '24/7 Security'),

    (5, 'Has curfew'),
    (5, 'Has canteen'),

    (6, 'Near campus'),
    (6, 'Air-conditioned rooms');

-- 11. ACCOMODATION IMAGES
INSERT INTO accommodation_images 
    (accommodation_id, image_file_id)
VALUES
    (1, 36),
    (1, 37),
    (2, 38),
    (2, 39),
    (3, 40),
    (3, 41),
    (4, 42),
    (5, 43),
    (5, 44),
    (5, 45),
    (6, 46),
    (6, 47);

-- 12. REVIEW
INSERT INTO reviews 
    (accommodation_id, student_number, rating, content)
VALUES
    (1, '2023123456', 4, 'Clean rooms, responsive landlord, and very close to the university.'),
    (1, '2023123457', 3, 'Decent but the room is small.'),
    (2, '2023123458', 5, NULL),
    (2, '2023123459', 5, 'Clean rooms, responsive landlord, and very close to the university.'),
    (3, '2023123460', 1, 'Maintenance needs improvement.'),
    (3, '2023123456', 4, 'Nice locatio12n, but the internet is sometimes slow.'),
    (4, '2023123457', 2, 'Noisy environment and needs better lighting.'),
    (4, '2023123458', 4, 'Spacious room but shared bathroom can be crowded.'),
    (5, '2023123459', 3, 'Affordable, but cleaning service is irregular.'),
    (5, '2023123460', 2, 'Walls are thin, noise from neighbors is noticeable.'),
    (6, '2023123456', 5, 'Excellent accommodation, would highly recommend!'),
    (6, '2023123456', 3, 'Average stay, nothing special but decent overall.');

-- 13. ROOM
INSERT INTO rooms 
    (accommodation_id, room_number, type, stay_type, capacity, current_occupancy, building, rent, tenant_restriction, availability)
VALUES
    -- Accommodation 1
    (1, '101', 'single', 'transient', 1, 0, 'Building A', 5000.00, 'coed', 'available'),
    (1, '102', 'double', 'transient', 2, 1, 'Building A', 6500.00, 'coed', 'available'),

    -- Accommodation 2
    (2, '201', 'single', 'transient', 1, 0, 'Building A', 6000.00, 'coed', 'available'),
    (2, '202', 'double', 'transient', 2, 2, 'Building A', 7000.00, 'coed', 'occupied'),

    -- Accommodation 3
    (3, '301', 'shared', 'transient', 4, 3, 'Building B', 800.00, 'non-coed', 'occupied'),
    (3, '302', 'shared', 'transient', 4, 1, 'Building C', 800.00, 'non-coed', 'available'),

    -- Accommodation 4
    (4, '401', 'shared', 'non_transient', 4, 4, 'Building A', 800.00, 'non-coed', 'occupied'),
    (4, '402', 'shared', 'non_transient', 4, 0, 'Building B', 800.00, 'non-coed', 'available'),

    -- Accommodation 5
    (5, '501', 'single', 'non_transient', 1, 0, 'Building C', 5500.00, 'coed', 'maintenance'),
    (5, '502', 'shared', 'non_transient', 3, 2, 'Building C', 6000.00, 'coed', 'available'),

    -- Accomodation 6
    (1, '303', 'shared', 'non_transient', 3, 1, 'Building A', 4800.00, 'coed', 'available'),
    (2, '203', 'single', 'non_transient', 1, 0, 'Building B', 6200.00, 'coed', 'available');

-- 14. APPLICATION 
INSERT INTO applications
    (accommodation_id, student_number, room_type, stay_type, status, duration_of_stay_days)
VALUES
    (1, '2023123456', 'single', 'non_transient', 'cancelled', 180),
    (6, '2023123456', 'single', 'non_transient', 'approved', 365),
    (5, '2023123456', 'single', 'non_transient', 'cancelled', 120),

    (2, '2023123457', 'double', 'non_transient', 'approved', 365),
    (6, '2023123457', 'single', 'transient', 'pending', 10),

    (4, '2023123458', 'shared', 'transient', 'under_review', 30),
    (5, '2023123458', 'shared', 'non_transient', 'pending', 180),

    (4, '2023123459', 'shared', 'non_transient', 'cancelled', 200),
    (1, '2023123459', 'single', 'non_transient', 'approved', 365),

    (3, '2023123460', 'shared', 'transient', 'waitlisted', 15),
    (2, '2023123460', 'double', 'transient', 'under_review', 60),

    (1, '2023123461', 'double', 'non_transient', 'approved', 150),
    (4, '2023123461', 'shared', 'non_transient', 'cancelled', 200),

    (6, '2023123462', 'single', 'transient', 'pending', 45),
    (4, '2023123462', 'shared', 'transient', 'approved', 90);
    
-- 15. ASSIGNMENT
INSERT INTO assignments
    (student_number, room_id, move_in, expected_move_out, actual_move_out, status, grace_period_days)
VALUES
    ('2023123456', 12, '2026-03-01', '2027-03-01', NULL, 'accepted', 5),
    ('2023123457', 4, '2026-02-15', '2027-02-15', '2027-02-15', 'accepted', 5),
    ('2023123459', 1, '2026-01-10', '2027-01-10', NULL, 'accepted', 5),
    ('2023123461', 2, '2026-03-05', '2026-08-05', NULL, 'accepted', 5),
    ('2023123462', 5, '2026-03-10', '2026-06-10', NULL, 'accepted', 5);

-- 16. BOOKMARK
INSERT INTO bookmarks
    (student_number, accommodation_id)
VALUES
    ('2023123456', 1),
    ('2023123456', 5),
    ('2023123457', 2),
    ('2023123457', 6),
    ('2023123458', 1),
    ('2023123458', 5),
    ('2023123459', 2),
    ('2023123460', 3),
    ('2023123461', 2),
    ('2023123462', 4);

-- 17. FEE
INSERT INTO fees
    (landlord_id, student_number, due_date, category, amount, balance, status)
VALUES
    (12, '2023123456', '2026-04-30', 'rent', 6200.00, 6200.00, 'unpaid'),
    (9, '2023123457', '2026-04-30', 'utilities', 1200.00, 0.00, 'paid'),
    (8, '2023123459', '2026-04-30', 'rent', 5000.00, 0.00, 'paid'),
    (8, '2023123461', '2026-04-30', 'miscellaneous', 800.00, 400.00, 'partial'),
    (11, '2023123462', '2026-03-31', 'rent', 800.00, 800.00, 'overdue');

-- 18. PAYMENT
INSERT INTO payments 
    (fee_id, proof_file_id, amount, mode_of_payment)
VALUES
    (2, 48, 1200.00, 'GCash'),
    (3, 49, 5000.00, 'Bank Transfer'),
    (4, 50, 400.00, 'Cash');

-- 19. LOG
INSERT INTO logs
    (actor_id, entity_type, entity_id, timestamp, activity_type, activity_details)
VALUES
    (2, 'application', 1, '2026-03-01 09:15:00', 'create', 'Student submitted application for Accommodation 1'),
    (3, 'assignment', 1, '2026-03-01 10:00:00', 'assign', 'Student assigned to Room 101 in Accommodation 1'),
    (5, 'fee', 1, '2026-03-02 14:20:00', 'create', 'Landlord issued rent fee for student 2023123456'),
    (6, 'accommodation', 1, '2026-03-02 16:35:00', 'update', 'Updated capacity of Accommodation 1'),
    (4, 'document', 1, '2026-03-03 11:45:00', 'upload', 'Student uploaded enrollment proof'),
    (7, 'room', 1, '2026-03-03 13:00:00', 'maintenance', 'Room 101 set to maintenance mode'),
    (2, 'application', 2, '2026-03-04 08:20:00', 'approve', 'Application for Accommodation 2 approved'),
    (3, 'assignment', 2, '2026-03-04 09:00:00', 'move_in', 'Student moved into Room 102'),
    (5, 'fee', 2, '2026-03-05 15:10:00', 'payment', 'Student 2023123457 partially paid utilities fee'),
    (6, 'accommodation', 2, '2026-03-05 16:30:00', 'update', 'Changed accommodation type to coed');

-- 20. SYSTEM NOTIFICATIONS
INSERT INTO notifications 
    (user_id, notification_content, read_status, type)
VALUES
    (2, 'Your rent payment is due on March 15, 2026.', 'unread', 'fee_due'),
    (4, 'Your accommodation application has been approved.', 'read', 'application_status'),
    (3, 'System maintenance is scheduled on March 12, 2026.', 'unread', 'system'),
    (6, 'Please update your profile information.', 'read', 'other'),
    (7, 'Your utility fee is due tomorrow.', 'unread', 'fee_due');

-- 21. SYSTEM VARIABLES (FOR BACKEND STUFF)
INSERT INTO sys_variables 
    (current_semester, current_sy, sem_start_date, uplb_latitude, uplb_longitude)
VALUES
    ('first_sem', '2024-2025', '2024-08-20', 14.1651, 121.2402),
    ('second_sem', '2024-2025', '2025-01-13', 14.1651, 121.2402),
    ('midyear', '2024-2025', '2025-06-10', 14.1651, 121.2402),
    ('first_sem', '2025-2026', '2025-08-19', 14.1651, 121.2402),
    ('second_sem', '2025-2026', '2026-01-12', 14.1651, 121.2402);

