----- RETRIEVE -----
-- Retrieve by ID
SELECT * FROM room 
WHERE room_id = 67;

-- Retrieve by accommodation_id
SELECT * FROM room r
JOIN accommodation a ON r.accommodation_id = a.accommodation_id
WHERE r.accommodation_id = 67;

-- Retrieve by accommodation_id and room_type
SELECT * FROM room r
JOIN accommodation a ON r.accommodation_id = a.accommodation_id
WHERE r.accommodation_id = 67
    AND r.room_type = 'shared';

----- UPDATE -----
-- Update room number by room_id
UPDATE room 
SET room_number = '679'
WHERE room_id = 67; 

-- Update room type by room_id
UPDATE room 
SET room_type = 'single'
WHERE room_id = 67; 

-- Update room capacity by room_id
UPDATE room 
SET room_capacity = 4
WHERE room_id = 67; 

-- Update room current occupancy by room_id
UPDATE room 
SET room_current_occupancy = 4
WHERE room_id = 67; 

-- Update room building by room_id
UPDATE room 
SET room_building = 'janelle'
WHERE room_id = 67; 

-- Update room rent by room_id
UPDATE room 
SET room_rent = 69420.67
WHERE room_id = 67; 

-- Update room availability by room_id
UPDATE room 
SET room_availability = 'occupied'
WHERE room_id = 67; 

----- DELETE -----
-- Delete room from table 
DELETE FROM room 
WHERE room_id = 67;




