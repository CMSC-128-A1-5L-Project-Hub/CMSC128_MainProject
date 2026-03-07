----- RETRIEVE -----
-- Retrieve all transient rooms
SELECT * FROM transient;

-- Retrieve transient room by transient_id
SELECT * FROM transient
WHERE transient_id = 67;

----- UPDATE -----
-- Update room number by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_number = '679'
WHERE r.room_id = 67;

-- Update room type by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_type = 'single'
WHERE r.room_id = 67;

-- Update room capacity by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_capacity = 4
WHERE r.room_id = 67;


-- Update room capacity by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_capacity = 4
WHERE r.room_id = 67;

-- Update room current occupancy by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_current_occupancy = 4
WHERE r.room_id = 67;

-- Update room building by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_building = 'janelle'
WHERE r.room_id = 67;

-- Update room rent by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_rent = 69420.67
WHERE r.room_id = 67;

-- Update room availability by transient_id
UPDATE transient t
JOIN room r ON t.room_id = r.room_id
SET room_availability = 'occupied'
WHERE r.room_id = 67;

----- DELETE -----
-- Delete transient room by transient_id
DELETE FROM transient t
JOIN room r on t.room_id = r.room_id
WHERE transient_id = 67;



