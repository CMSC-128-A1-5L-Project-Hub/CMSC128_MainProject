-- Retrieve by accommodation_id
-- Update by accommodation_id
-- Delete by accommodation_id, by ID

----- RETRIEVE -----
-- Retrieve by accommodation_id
SELECT * FROM accommodation_images ai
JOIN accommodation ac ON ai.accommodation_id = ac.accommodation_id
WHERE ai.accommodation_id = 67;

----- UPDATE ----- 
-- Update by accommodation_id
UPDATE accommodation_images ai
JOIN accommodation ac ON ai.accommodation_id = ac.accommodation_id
SET ai.image_file_id = 67;
WHERE ai.accommodation_id = 67;

----- DELETE -----
-- Delete by accommodation_id
DELETE FROM accommodation_images ai
JOIN accommodation ac ON ai.accommodation_id = ac.accommodation_id
WHERE ai.accommodation_id = 67;

-- Delete by images_id
DELETE FROM accommodation_images ai
JOIN accommodation ac ON ai.accommodation_id = ac.accommodation_id
WHERE ai.images_id = 67;