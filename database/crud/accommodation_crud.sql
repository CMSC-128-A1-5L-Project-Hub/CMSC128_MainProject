----- RETRIEVE -----
-- Retrieve all accommodations
SELECT * FROM accommodations;

-- Retrieve by accommodation_id
SELECT * FROM accommodations
WHERE accommodation_id = 67;

-- Retrieve by accommodation_type
SELECT * FROM accommodations
WHERE accommodation_type = 'on-campus';

-- Retrieve by tenant_restriction
SELECT * FROM accommodations
WHERE tenant_restriction = 'coed';

-- Retrieve by landlord_id
SELECT * FROM accommodations
WHERE landlord_id = 67;

-- Retrieve by manager_id
SELECT * FROM accommodations
WHERE manager_id = 67;

----- UPDATE -----
-- Update accommodation name by accommodation_id
UPDATE accommodations 
SET accommodation_name = "janelle"
WHERE accommodation_id = 67;

-- Update accommodation location by accommodation_id
UPDATE accommodations 
SET accommodation_location = "dorm ni janelle"
WHERE accommodation_id = 67;

-- Update accommodation type by accommodation_id
UPDATE accommodations 
SET accommodation_type = "on-campus"
WHERE accommodation_id = 67;

-- Update accommodation capacity by accommodation_id
UPDATE accommodations 
SET accommodation_capacity = 67
WHERE accommodation_id = 67;

-- Update tenant restriction by accommodation_id
UPDATE accommodations 
SET tenant_restriction = 'coed'
WHERE accommodation_id = 67;

-- Update manager_id by accommodation_id
UPDATE accommodations 
SET manager_id = 67
WHERE accommodation_id = 67;

-- Update application start date by accommodation_id
UPDATE accommodations
SET application_start_date = '2067-06-07'
WHERE accommodation_id = 67;

-- Update application end date by accommodation_id
UPDATE accommodations
SET application_end_date = '2067-06-07'
WHERE accommodation_id = 67;

----- DELETE -----
-- Delete accommodation by accommodation_id
DELETE FROM accommodations
WHERE accommodation_id = 67;





