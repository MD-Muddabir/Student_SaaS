/**
 * Global Error Handling Middleware
 * Centralized error handler for all Express errors
 */

const errorHandler = (err, req, res, next) => {
    console.error("❌ Global Error:", err);

    // Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
        });
    }

    // Sequelize unique constraint errors
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            success: false,
            message: "Duplicate entry",
            field: err.errors[0]?.path,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired" });
    }

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size too large. Maximum 5MB allowed." });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
