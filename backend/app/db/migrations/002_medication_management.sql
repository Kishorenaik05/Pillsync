-- Medication Management and Reminders Schema for PillSync (PostgreSQL)

-- Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    form VARCHAR(50), -- e.g., Tablet, Syrup, Injection
    strength VARCHAR(50), -- e.g., 500mg, 10ml
    quantity_in_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medication Schedules Table
CREATE TABLE IF NOT EXISTS medication_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    frequency VARCHAR(50) NOT NULL, -- e.g., 'Daily', 'Twice a Day', 'As Needed'
    time_of_day TIME NOT NULL, -- e.g., '08:00', '20:00'
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medication Logs Table (History)
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('TAKEN', 'MISSED', 'SNOOZED')),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    action_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
