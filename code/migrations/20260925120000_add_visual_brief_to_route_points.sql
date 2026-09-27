-- Store the selected visual direction and image-provider prompt audit data.
ALTER TABLE route_points
  ADD COLUMN IF NOT EXISTS visual_brief JSON NULL AFTER image_prompt;
