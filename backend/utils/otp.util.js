const crypto = require('crypto');
const { OtpVerification } = require('../models');

// Generate 6-digit OTP
exports.generateOtp = () => {
    return String(crypto.randomInt(100000, 999999));
};

// Save or replace OTP for email + type
exports.saveOtp = async (email, otp, type) => {
    // Delete any old unused OTPs for this email+type
    await OtpVerification.destroy({ where: { email, type, is_used: false } });

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expires_at = new Date(Date.now() + expiryMinutes * 60 * 1000);

    return OtpVerification.create({ email, otp, type, expires_at });
};

// Validate OTP — returns { valid, message, record }
exports.validateOtp = async (email, otp, type) => {
    const record = await OtpVerification.findOne({
        where: { email, type, is_used: false },
        order: [['created_at', 'DESC']]
    });

    if (!record) return { valid: false, message: 'OTP not found. Please request a new one.' };
    if (new Date() > record.expires_at) return { valid: false, message: 'OTP has expired. Please request a new one.' };
    if (record.attempt_count >= 5) return { valid: false, message: 'Too many attempts. Please request a new OTP.' };

    if (record.otp !== otp) {
        await record.increment('attempt_count');
        const remaining = 5 - (record.attempt_count + 1);
        return { valid: false, message: `Incorrect OTP. ${remaining > 0 ? remaining + ' attempts remaining.' : 'Locked out.'}` };
    }

    return { valid: true, record };
};

// Mark OTP as used
exports.invalidateOtp = async (record) => {
    await record.update({ is_used: true });
};
