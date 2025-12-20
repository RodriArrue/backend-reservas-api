const authMiddleware = require('./authMiddleware');
const { requireRole, requireAdmin, requireUser } = require('./roleMiddleware');

module.exports = {
    authMiddleware,
    requireRole,
    requireAdmin,
    requireUser
};
