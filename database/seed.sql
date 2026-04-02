-- Seed Data for Bishop Martin Document Request Portal

TRUNCATE TABLE document_types RESTART IDENTITY CASCADE;

INSERT INTO document_types (name, description) VALUES
('lateness_form', 'Lateness Form'),
('absence_form', 'Absence Form'),
('enrolment_letter', 'Enrolment Letter'),
('transcript', 'Transcript'),
('field_trip_consent_form', 'Field Trip Consent Form');

TRUNCATE TABLE school_payment_info RESTART IDENTITY CASCADE;

INSERT INTO school_payment_info (bank_name, account_name, account_number, instructions) VALUES
('Belize Bank', 'Bishop Martin High School', '123456789', 'Transfer the required payment to the school bank account and upload a clear image of your payment receipt.');

TRUNCATE TABLE staff RESTART IDENTITY CASCADE;

-- Default staff accounts (password for all is 'password123' -> $2b$10$w6z/6gR/A... hash is provided below)
INSERT INTO staff (full_name, email, password_hash, role) VALUES
('Default Accounts Clerk', 'clerk@bmhs.edu.bz', '$2b$10$QO0j8T/L2yV2w5W8cR7J3ONxQj7iUv5XJ.eU7qJtE4F63eWwF.C', 'accounts_clerk'),
('Default IT Technician', 'it@bmhs.edu.bz', '$2b$10$QO0j8T/L2yV2w5W8cR7J3ONxQj7iUv5XJ.eU7qJtE4F63eWwF.C', 'it_technician'),
('Default Office Staff', 'office@bmhs.edu.bz', '$2b$10$QO0j8T/L2yV2w5W8cR7J3ONxQj7iUv5XJ.eU7qJtE4F63eWwF.C', 'office_staff');
