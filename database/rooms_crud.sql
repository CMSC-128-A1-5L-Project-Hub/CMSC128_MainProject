----- RETRIEVE -----
-- Retrieve by ID
SELECT * FROM rooms 
WHERE room_id = 67;

-- Retrieve by room_stay_type
SELECT * FROM rooms 
WHERE room_stay_type = 'transient';

-- Retrieve by tenant_restriction
SELECT * FROM rooms
WHERE tenant_restriction = 'coed';

-- Retrieve by accommodation_id
SELECT * FROM rooms r
JOIN accommodation a ON r.accommodation_id = a.accommodation_id
WHERE r.accommodation_id = 67;

-- Retrieve by accommodation_id and room_type
SELECT * FROM rooms r
JOIN accommodation a ON r.accommodation_id = a.accommodation_id
WHERE r.accommodation_id = 67
    AND r.room_type = 'shared';

-- Retrieve by accommodation_id and room_stay_type
SELECT * FROM rooms r
JOIN accommodation a ON r.accommodation_id = a.accommodation_id
WHERE r.accommodation_id = 67
    AND r.room_stay_type = 'transient';

----- UPDATE -----
-- Update room number by room_id
UPDATE rooms 
SET room_number = '679'
WHERE room_id = 67; 

-- Update room type by room_id
UPDATE rooms 
SET room_type = 'single'
WHERE room_id = 67; 

-- Update room stay type by room_id
UPDATE rooms 
SET room_stay_type = 'transient'
WHERE room_id = 67; 

-- Update room capacity by room_id
UPDATE rooms 
SET room_capacity = 4
WHERE room_id = 67; 

-- Update room current occupancy by room_id
UPDATE rooms 
SET room_current_occupancy = 4
WHERE room_id = 67; 

-- Update room building by room_id
UPDATE rooms 
SET room_building = 'janelle'
WHERE room_id = 67; 

-- Update room rent by room_id
UPDATE rooms 
SET room_rent = 69420.67
WHERE room_id = 67; 

-- Update room availability by room_id
UPDATE rooms 
SET room_availability = 'occupied'
WHERE room_id = 67; 

-- Update tenant restriction by room_id
UPDATE rooms
SET tenant_restriction = 'coed'
WHERE room_id = 67;

----- DELETE -----
-- Delete room from table 
DELETE FROM rooms 
WHERE room_id = 67;




