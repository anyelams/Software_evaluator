const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Verifica que el usuario tenga un token JWT válido.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // formato: "Bearer token"

  if (!token)
    return res.status(401).json({ message: "Token no proporcionado" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Token inválido o expirado" });

    req.user = user; // contiene id y role
    next();
  });
};

/**
 * Middleware para verificar si el usuario tiene el rol necesario.
 */
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol no autorizado" });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
