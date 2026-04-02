const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        
        if (role === 'staff' && req.user.type !== 'staff') {
            return res.status(403).json({ message: 'Access denied. Staff only.' });
        }
        if (role === 'parent' && req.user.type !== 'parent') {
            return res.status(403).json({ message: 'Access denied. Parents only.' });
        }
        
        next();
    }
};

module.exports = requireRole;
