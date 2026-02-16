-- Create Super Admin User
-- Email: owner@saas.com
-- Password: superadmin123 (will be hashed)

-- First, insert a super admin user (institute_id can be NULL for super admin)
INSERT INTO users (institute_id, role, name, email, password_hash, status, created_at, updated_at)
VALUES (
    NULL,
    'super_admin',
    'Platform Owner',
    'owner@saas.com',
    '$2b$10$YourHashedPasswordHere',  -- This will be replaced by actual hash
    'active',
    NOW(),
    NOW()
);

-- Note: The password hash above is a placeholder
-- You need to hash 'superadmin123' using bcrypt

-- To create the actual hash, you can use this Node.js code:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('superadmin123', 10);
-- console.log(hash);
