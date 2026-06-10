-- Seed Data for Bishop Martin Document Request Portal (V2)

TRUNCATE TABLE document_types RESTART IDENTITY CASCADE;

INSERT INTO document_types (name, description, is_auto_generated, requires_payment) VALUES
('transcript', 'Official Transcript - Certified copy of student record', FALSE, TRUE),
('enrollment_verification', 'Enrollment Verification - Official letter verifying status', TRUE, FALSE),
('disciplinary_record', 'Disciplinary Record - Summary of disciplinary history', TRUE, FALSE),
('duplicate_diploma', 'Duplicate Diploma - Replacement copy of graduation diploma', FALSE, TRUE),
('custom_request', 'Custom Request - Specific letters or forms', FALSE, TRUE);

TRUNCATE TABLE school_payment_info RESTART IDENTITY CASCADE;

INSERT INTO school_payment_info (bank_name, account_name, account_number, instructions) VALUES
('Belize Bank', 'Bishop Martin High School', '123456789', 'Transfer the required payment for letters/transcripts to the school bank account and upload a clear image of your receipt.');

TRUNCATE TABLE staff RESTART IDENTITY CASCADE;

-- Default staff accounts (password for all is 'password123' -> $2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe hash)
INSERT INTO staff (full_name, email, password_hash, role) VALUES
('Default Staff Office', 'office@bmhs.edu.bz', '$2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe', 'staff'),
('System Principal', 'principal@bmhs.edu.bz', '$2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe', 'principal');
