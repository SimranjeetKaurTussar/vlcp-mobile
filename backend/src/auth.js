function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  // Demo token format: role:userId (e.g. seller:usr_123)
  const [role, userId] = token.split(":");

  if (!role || !userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = { role, id: userId };
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { authRequired, requireRoles };
