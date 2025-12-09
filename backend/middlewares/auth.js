const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: "Accès refusé : pas de token" });
    }

    // Supporte "Bearer <token>" ou juste "<token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
}

module.exports = verifyToken;