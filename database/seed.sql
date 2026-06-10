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

-- Default parent account (password is 'password123')
INSERT INTO parents (full_name, email, phone, password_hash, verified, user_type) VALUES
('John Doe', 'john@example.com', '600-1234', '$2b$10$di3t2eLvt18mOC6B7DkXWOBo94dzjmMC2ogxDstFoAQ7fzgIqvOHe', TRUE, 'parent');

-- Mock document requests for John Doe
INSERT INTO document_requests (parent_id, student_bemis_id, student_full_name, student_graduation_year_or_years_attended, document_type_id, status, request_date, delivery_method) VALUES
(1, 'STU-9824', 'Eleanor Vance', 'Sophomore', 1, 'issued', '2026-06-05 10:00:00', 'pickup'),
(1, 'STU-7511', 'Theodore Hayes', 'Freshman', 2, 'processing', '2026-06-08 14:30:00', 'emailed'),
(1, 'STU-9824', 'Eleanor Vance', 'Sophomore', 3, 'pending', '2026-06-09 09:15:00', 'pickup');
