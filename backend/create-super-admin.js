/**
 * Create Super Admin User
 * Run this script once to create the super admin account
 * Usage: node create-super-admin.js
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSuperAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'tiger',
        database: process.env.DB_NAME || 'student_saas'
    });

    try {
        // Hash the password
        const password = 'superadmin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if super admin already exists
        const [existing] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['owner@saas.com']
        );

        if (existing.length > 0) {
            console.log('❌ Super Admin already exists!');
            console.log('Email: owner@saas.com');
            console.log('You can login with existing credentials');
            return;
        }

        // Insert super admin user
        const [result] = await connection.execute(
            `INSERT INTO users (institute_id, role, name, email, password_hash, status, created_at, updated_at)
             VALUES (NULL, 'super_admin', 'Platform Owner', 'owner@saas.com', ?, 'active', NOW(), NOW())`,
            [hashedPassword]
        );

        console.log('✅ Super Admin created successfully!');
        console.log('');
        console.log('📧 Email: owner@saas.com');
        console.log('🔑 Password: superadmin123');
        console.log('');
        console.log('🚀 You can now login at: http://localhost:5174/login');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
    } finally {
        await connection.end();
    }
}

createSuperAdmin();
