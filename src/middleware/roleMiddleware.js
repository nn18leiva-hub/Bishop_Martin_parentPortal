const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const type = req.user.type; // 'parent' or 'staff'
        const role = req.user.role; // 'viewer', 'admin', 'super_admin' or undefined
        
        // Block viewers from modifying resources (only GET allowed)
        if (role === 'viewer' && req.method !== 'GET') {
            return res.status(403).json({ message: 'Access denied. Viewers are restricted to read-only actions.' });
        }

        // 1. Parent endpoints only for parents and past students
        if (requiredRole === 'parent') {
            if (type !== 'parent' && type !== 'past_student') return res.status(403).json({ message: 'Access denied. Parents and Past Students only.' });
            return next();
        }

        // 2. Staff endpoint handling
        if (type !== 'staff') {
            return res.status(403).json({ message: 'Access denied. Staff only.' });
        }

        // Broad staff actions (like fetching requests or verifying)
        if (requiredRole === 'staff') {
            return next();
        }

        // 3. Super Admin / Principal strict lock (for creation and deletion mechanics)
        if (requiredRole === 'super_admin' || requiredRole === 'principal') {
            if (role !== 'super_admin' && role !== 'principal') {
                return res.status(403).json({ message: 'Access denied. Principal tier authorization required.' });
            }
            return next();
        }

        return res.status(403).json({ message: 'Access denied. Invalid target role parameters.' });
    }
};

module.exports = requireRole;
