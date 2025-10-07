
-- Add work_days column to personnel_allocations table
ALTER TABLE public.personnel_allocations 
ADD COLUMN work_days text[] DEFAULT '{}';
