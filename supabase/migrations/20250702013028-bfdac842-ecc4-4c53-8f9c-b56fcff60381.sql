-- Add paid field to work_records table for payment control
ALTER TABLE public.work_records 
ADD COLUMN paid boolean DEFAULT false;

-- Add proper date field to work_records
ALTER TABLE public.work_records 
ADD COLUMN work_date date;