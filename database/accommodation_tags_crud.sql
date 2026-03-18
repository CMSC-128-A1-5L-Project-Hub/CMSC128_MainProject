-- Retrieve by accommodation-id, tag_detail
-- Delete by ID

----- RETRIEVE -----
-- Retrieve by accommodation_id
SELECT * FROM accommodation_tags aa
JOIN accommodation ac ON aa.accommodation_id = ac.accommodation_id
WHERE aa.accommodation_id = 67;

-- Retrieve by tag_detail
SELECT * FROM accommodation_tags 
WHERE tag_detail = 'gusto ni janelle';

----- DELETE -----
-- Delete by tag_id
DELETE FROM accommodation_tags
WHERE tags_id = 67;
