const authorizeRole = (role) => {
  return (req, res, next) => {
    console.log('=== authorizeRole middleware ===');
    console.log('Rôle requis:', role);
    console.log('Rôle utilisateur:', req.user?.role);
    console.log('User complet:', req.user);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ 
        message: `Accès interdit. Rôle requis: ${role}, votre rôle: ${req.user.role}` 
      });
    }
    
    next();
  };
};

module.exports = authorizeRole;