const jwt = require("jsonwebtoken");
const { User, Institute } = require("../models");

// Cache institute status in memory for 60 seconds to avoid hitting DB on every API request
const statusCache = new Map();

const getInstituteStatus = async (instituteId) => {
  const cached = statusCache.get(instituteId);
  if (cached && Date.now() - cached.time < 60000) return cached.status;

  const inst = await Institute.findByPk(instituteId, { attributes: ['status'] });
  const status = inst ? inst.status : null;
  statusCache.set(instituteId, { status, time: Date.now() });
  return status;
};

// Export clear function so controllers can instantly invalidate the cache when status changes
const clearInstituteCache = (instituteId) => statusCache.delete(instituteId);

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // For managers, students, and parents: check live status from DB to enforce blocking in real-time
    if (decoded.role === 'manager' || decoded.role === 'student' || decoded.role === 'parent') {
      const dbUser = await User.findByPk(decoded.id, {
        attributes: ['id', 'status', 'permissions', 'role']
      });

      if (!dbUser) {
        return res.status(401).json({ error: "User not found" });
      }

      if (dbUser.status === 'blocked') {
        return res.status(403).json({
          error: "Account blocked",
          code: "ACCOUNT_BLOCKED",
          message: "Your account has been blocked by the administrator. Please contact them to regain access."
        });
      }

      if (decoded.role === 'manager') {
        // Refresh permissions from DB (in case admin updated them after login)
        req.user.permissions = dbUser.permissions;
        req.user.status = dbUser.status;
      }
    }

    // ── Check if institute is suspended ─────────────────────────────────────
    if (req.user.institute_id && req.user.role !== 'super_admin') {
      const instituteStatus = await getInstituteStatus(req.user.institute_id);

      if (!instituteStatus) {
        return res.status(401).json({
          success: false,
          error: "Institute not found",
          message: 'Institute not found. Please contact support.'
        });
      }

      if (instituteStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          code: 'INSTITUTE_SUSPENDED',
          error: 'Institute Suspended',
          message: 'Your institute account has been suspended. Please contact support.'
        });
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;
module.exports.clearInstituteCache = clearInstituteCache;
