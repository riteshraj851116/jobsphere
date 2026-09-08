const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userRole = req.user.role || "user";
    const candidateRoles = ["user", "candidate", "jobseeker"];
    const isCandidateAllowed = allowedRoles.some((r) => candidateRoles.includes(r));
    const isAllowed =
      allowedRoles.includes(userRole) ||
      (isCandidateAllowed && candidateRoles.includes(userRole));

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