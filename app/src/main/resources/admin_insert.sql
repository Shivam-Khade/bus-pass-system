-- Insert Admin User
-- Password: '123456' (BCrypt hash required)
-- Note: The implementation uses AdminInitializer.java to automatically create this user with the correct hash.
-- If you run this manually, replace the password hash with a valid BCrypt hash for '123456'.

INSERT INTO users (name, email, password, role, phone, active) 
VALUES ('Admin', 'admin@gmail.com', '$2a$10$ExampleHashFor123456........', 'ADMIN', '0000000000', true);
