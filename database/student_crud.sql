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
WHERE s.user_id = 67;

-- Update user middle name from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.mname = 'Is'
WHERE s.user_id = 67;

-- Update user last name from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.lname = 'Games'
WHERE s.user_id = 67;

-- Update user suffix from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.suffix = 'Jr.'
WHERE s.user_id = 67;

-- Update user email from student table
UPDATE student s
JOIN user u ON s.user_id = u.user_id
SET u.email = 'bronnygames@lebronjames.com'
WHERE s.user_id = 67;


-- TODO: update enrollment proof di ko pa alam pano wit lang