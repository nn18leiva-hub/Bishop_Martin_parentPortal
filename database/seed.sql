-- Seed Data for Bishop Martin Document Request Portal (V2)

TRUNCATE TABLE document_types RESTART IDENTITY CASCADE;

INSERT INTO document_types (name, description, is_auto_generated, requires_payment) VALUES
('lateness_form', 'Lateness Form (Auto-generated slip)', TRUE, FALSE),
('absence_form', 'Absence Form (Auto-generated slip)', TRUE, FALSE),
('permission_slip', 'Permission Slip (Auto-generated)', TRUE, FALSE),
('enrolment_letter', 'Enrolment Letter', FALSE, TRUE),
('transcript', 'Transcript', FALSE, TRUE);

TRUNCATE TABLE school_payment_info RESTART IDENTITY CASCADE;

INSERT INTO school_payment_info (bank_name, account_name, account_number, instructions) VALUES
('Belize Bank', 'Bishop Martin High School', '123456789', 'Transfer the required payment for letters/transcripts to the school bank account and upload a clear image of your receipt.');

TRUNCATE TABLE staff RESTART IDENTITY CASCADE;

-- Default staff accounts (password for all is 'password123' -> $2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe hash)
INSERT INTO staff (full_name, email, password_hash, role) VALUES
('Principal Viewer', 'principal@bmhs.edu.bz', '$2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe', 'viewer'),
('Default Admin Office', 'office@bmhs.edu.bz', '$2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe', 'admin'),
('System Super Admin', 'superadmin@bmhs.edu.bz', '$2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe', 'super_admin');
