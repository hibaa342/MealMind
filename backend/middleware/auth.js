const jwt = require('jsonwebtoken');

function extractToken(req) {
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const legacy = req.header('x-auth-token');
  if (legacy) return legacy;
  return null;
}

module.exports = function(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, aucun token fourni' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, secret);
    
    // On attache l'utilisateur (l'ID) à la requête
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token non valide' });
  }
};