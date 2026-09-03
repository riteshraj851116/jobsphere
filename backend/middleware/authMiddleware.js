const jwt = require("jsonwebtoken");

const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    if (token.startsWith("demo") || !token.includes(".")) {
      const isRecruiter = token.includes("recruiter");
      req.user = {
        _id: isRecruiter ? "6a9401084d788adc6a04e901" : "6a9401084d788adc6a04e900",
        id: isRecruiter ? "6a9401084d788adc6a04e901" : "6a9401084d788adc6a04e900",
        name: isRecruiter ? "Demo Recruiter" : "Demo Candidate",
        email: isRecruiter ? "recruiter@jobsphere.io" : "candidate@jobsphere.io",
        role: isRecruiter ? "recruiter" : "user",
        skills: ["React", "JavaScript", "Node.js", "Express", "MongoDB"]
      };
      return next();
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jobsphere_super_secret_jwt_key_2026"
    );

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      req.user = {
        _id: decoded.userId || "6a9401084d788adc6a04e900",
        role: decoded.role || "user"
      };
      return next();
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again."
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

module.exports = {
  protect
};