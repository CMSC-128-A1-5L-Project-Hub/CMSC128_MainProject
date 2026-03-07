
----- RETRIEVE -----
-- Retrieve all accommodations
SELECT * FROM accommodation;

-- Retrieve by accommodation_id
SELECT * FROM accommodation
WHERE accommodation_id = 67;

-- Retrieve by accommodation_type
SELECT * FROM accommodation
WHERE accommodation_type = 'on-campus';

-- Retrieve by landlord_id
SELECT * FROM accommodation
WHERE landlord_id = 67;

-- Retrieve by manager_id
SELECT * FROM accommodation
WHERE manager_id = 67;

-- EXTRA: Retrieve all rooms under accommodation
SELECT * FROM room r
JOIN accommodation a ON r.accommodation_id = a.accommodation_id
WHERE accommodation_id = 67;


----- UPDATE -----
-- Update accommodation name by accommodation_id
UPDATE accommodation 
SET accommodation_name = "janelle"
WHERE accommodation_id = 67;

-- Update accommodation location by accommodation_id
UPDATE accommodation 
SET accommodation_location = "dorm ni janelle"
WHERE accommodation_id = 67;

-- Update accommodation type by accommodation_id
UPDATE accommodation 
SET accommodation_type = "on-campus"
WHERE accommodation_id = 67;

-- Update accommodation capacity by accommodation_id
UPDATE accommodation 
SET accommodation_capacity = 67
WHERE accommodation_id = 67;

----- DELETE -----
-- Delete accommodation by accommodation_id
DELETE FROM accommodation
WHERE accommodation_id = 67;





