const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Récupérer le header Authorization
  const authHeader = req.header('Authorization');

  // 2. Vérifier si le header existe et commence par "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé, aucun token fourni' });
  }

  // 3. Extraire le token (on enlève "Bearer ")
  const token = authHeader.split(' ')[1];

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