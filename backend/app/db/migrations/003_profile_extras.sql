-- Migration 003: Add phone and emergency contact columns to patient_profiles

ALTER TABLE patient_profiles
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30);
