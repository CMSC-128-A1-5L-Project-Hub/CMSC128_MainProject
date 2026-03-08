----- RETRIEVE -----
-- Retrieve by accommodation_id
SELECT * FROM application ap
JOIN accommodation ac ON ap.accommodation_id = ac.accommodation_id
WHERE ap.accommodation_id = 67;

-- Retrieve by student_number
SELECT * FROM application 
WHERE student_number = '1234567890';

-- Retrieve by application_date
SELECT * FROM application 
WHERE DATE(application_date) = '2067-06-07';

-- Retrieve by application_room_type
SELECT * FROM application
WHERE application_room_type = 'single';

-- Retrieve by duration_of_stay_days
SELECT * FROM application
WHERE duration_of_stay_days = 3;

-- Retrieve by application_status
SELECT * FROM application
WHERE application_status = 'pending';

----- UPDATE -----
-- Update application status by application_id
UPDATE application
SET application_status = 'approved'
WHERE application_id = 67;
