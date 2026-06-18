module.exports = function(req, res, next) {
    // Check if req.user exists and has role 'admin'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }
};
