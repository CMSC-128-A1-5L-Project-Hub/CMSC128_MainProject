----- RETRIEVE -----
-- Retrieve all students
SELECT * FROM student;

-- Retrieve one student by ID
SELECT * FROM student 
WHERE student_number = '0123456789';

----- UPDATE -----
-- Update user first name from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.fname = 'Bronny'
WHERE s.student_number = '0123456789'

-- Update user middle name from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.mname = 'Is'
WHERE s.student_number = '0123456789'

-- Update user last name from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.lname = 'Games'
WHERE s.student_number = '0123456789'

-- Update user suffix from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.suffix = 'Jr.'
WHERE s.student_number = '0123456789'

-- Update user email from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.email = 'bronnygames@lebronjames.com'
WHERE s.student_number = '0123456789'

-- Update facebook account from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.facebook_account = 'Bronny Is Games Jr.'
WHERE s.student_number = '0123456789'

-- Update enrollment proof
UPDATE student s
JOIN file_metadata f ON s.enrollment_proof_file_id = f.file_id
SET s.enrollment_proof_file_id = 67
WHERE s.student_number = '0123456789'

-- TODO: update enrollment proof di ko pa alam pano wit lang