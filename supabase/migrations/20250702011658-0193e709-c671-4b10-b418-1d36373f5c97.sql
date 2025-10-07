-- Add missing columns to personnel table for email, phone, and overtime_rate
ALTER TABLE public.personnel 
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN overtime_rate NUMERIC DEFAULT 0;