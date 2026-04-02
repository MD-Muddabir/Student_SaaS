const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RazorpayPayment = sequelize.define("RazorpayPayment", {
    institute_id: { type: DataTypes.INTEGER, allowNull: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    razorpay_payment_id: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    razorpay_order_id: { type: DataTypes.STRING(100), allowNull: true },
    razorpay_signature: { type: DataTypes.STRING(500), allowNull: true },
    signature_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    amount_paid: { type: DataTypes.INTEGER, allowNull: false }, // stored in paise
    payment_method: { type: DataTypes.STRING(50), allowNull: true },
    bank: { type: DataTypes.STRING(100), allowNull: true },
    wallet: { type: DataTypes.STRING(50), allowNull: true },
    vpa: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    contact: { type: DataTypes.STRING(20), allowNull: true },
    paid_at: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: "razorpay_payments",
    timestamps: true
});

module.exports = RazorpayPayment;
