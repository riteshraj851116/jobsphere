const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userRole = req.user.role;
    const isAllowed =
      allowedRoles.includes(userRole) ||
      (allowedRoles.includes("user") && userRole === "candidate") ||
      (allowedRoles.includes("candidate") && userRole === "user");

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};

module.exports = authorizeRoles;