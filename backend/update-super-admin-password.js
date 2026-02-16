/**
 * Update Super Admin Password
 * This script updates the super admin password with proper hashing
 * Run this to fix the login issue
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSuperAdminPassword() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'tiger',
        database: process.env.DB_NAME || 'student_saas'
    });

    try {
        // Hash the password properly
        const password = 'superadmin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('🔐 Hashed password:', hashedPassword);

        // Update the super admin password
        const [result] = await connection.execute(
            `UPDATE users 
             SET password_hash = ? 
             WHERE email = 'owner@saas.com'`,
            [hashedPassword]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Super Admin password updated successfully!');
            console.log('');
            console.log('📧 Email: owner@saas.com');
            console.log('🔑 Password: superadmin123');
            console.log('');
            console.log('🚀 You can now login at: http://localhost:5174/login');
        } else {
            console.log('❌ Super Admin user not found!');
            console.log('Creating new super admin...');

            // Create super admin if not exists
            await connection.execute(
                `INSERT INTO users (institute_id, role, name, email, password_hash, status, created_at, updated_at)
                 VALUES (NULL, 'super_admin', 'Platform Owner', 'owner@saas.com', ?, 'active', NOW(), NOW())`,
                [hashedPassword]
            );

            console.log('✅ Super Admin created successfully!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

updateSuperAdminPassword();
