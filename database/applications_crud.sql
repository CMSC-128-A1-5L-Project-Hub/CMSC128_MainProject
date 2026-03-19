----- RETRIEVE -----
-- Retrieve by accommodation_id
SELECT * FROM applications ap
JOIN accommodation ac ON ap.accommodation_id = ac.accommodation_id
WHERE ap.accommodation_id = 67;

-- Retrieve by student_number
SELECT * FROM applications
WHERE student_number = '1234567890';

-- Retrieve by application_date
SELECT * FROM applications
WHERE DATE(application_date) = '2067-06-07';

-- Retrieve by application_room_type
SELECT * FROM applications
WHERE application_room_type = 'single';

-- Retrieve by duration_of_stay_days
SELECT * FROM applications
WHERE duration_of_stay_days = 3;

-- Retrieve by application_status
SELECT * FROM applications
WHERE application_status = 'pending';

----- UPDATE -----
-- Update application status by application_id
UPDATE applications
SET application_status = 'approved'
WHERE application_id = 67;
