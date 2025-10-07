-- Add PIX key encrypted column to personnel table
ALTER TABLE public.personnel
ADD COLUMN IF NOT EXISTS pix_key_encrypted text;