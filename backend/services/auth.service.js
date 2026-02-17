const { Institute, User, Plan, Subscription } = require("../models");
const { hashPassword, comparePassword } = require("../utils/hashPassword");

exports.registerInstitute = async (data) => {
    const { instituteName, email, password, phone } = data;

    // Create Institute
    const institute = await Institute.create({
        name: instituteName,
        email,
        phone,
        status: "active",
    });

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create Admin User
    const adminUser = await User.create({
        institute_id: institute.id,
        role: "admin",
        name: "Admin",
        email,
        phone,
        password_hash: hashedPassword,
        status: "active",
    });

    return { institute, adminUser };
};

exports.loginUser = async (email, password) => {
    const user = await User.findOne({
        where: { email },
        include: [{ model: Institute, attributes: ['name'] }]
    });

    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) throw new Error("Invalid credentials");

    return user;
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(oldPassword, user.password_hash);
    if (!isMatch) throw new Error("Incorrect old password");

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password_hash: hashedPassword });

    return true;
};

exports.getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role', 'institute_id'],
        include: [{ model: Institute, attributes: ['name'] }]
    });
    if (!user) throw new Error("User not found");
    return user;
};

exports.updateProfile = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    await user.update(data);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institute_id: user.institute_id
    };
};
