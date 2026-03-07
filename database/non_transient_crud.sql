----- RETRIEVE -----
-- Retrieve all non_transient rooms
SELECT * FROM non_transient;

-- Retrieve non_transient room by non_transient_id
SELECT * FROM non_transient
WHERE non_transient_id = 67;

----- UPDATE -----
-- Update room number by non_transient_id
UPDATE non_transient nt
JOIN room r ON nt.room_id = r.room_id
SET room_number = '679'
WHERE r.room_id = 67;

-- Update room type by non_transient_id
UPDATE non_transient mt
JOIN room r ON nt.room_id = r.room_id
SET room_type = 'single'
WHERE r.room_id = 67;

-- Update room capacity by non_transient_id
UPDATE non_transient nt
JOIN room r ON nt.room_id = r.room_id
SET room_capacity = 4
WHERE r.room_id = 67;


-- Update room capacity by non_transient_id
UPDATE non_transient nt
JOIN room r ON nt.room_id = r.room_id
SET room_capacity = 4
WHERE r.room_id = 67;

-- Update room current occupancy by non_transient_id
UPDATE non_transient nt
JOIN room r ON nt.room_id = r.room_id
SET room_current_occupancy = 4
WHERE r.room_id = 67;

-- Update room building by non_transient_id
UPDATE non_transient nt
JOIN room r ON nt.room_id = r.room_id
SET room_building = 'janelle'
WHERE r.room_id = 67;

-- Update room rent by non_transient_id
UPDATE non_transient nt
JOIN room r ON t.room_id = r.room_id
SET room_rent = 69420.67
WHERE r.room_id = 67;

-- Update room availability by non_transient_id
UPDATE non_transient nt
JOIN room r ON nt.room_id = r.room_id
SET room_availability = 'occupied'
WHERE r.room_id = 67;

----- DELETE -----
-- Delete non_transient room by non_transient_id
DELETE FROM non_transient nt
JOIN room r on nt.room_id = r.room_id
WHERE non_transient_id = 67;



