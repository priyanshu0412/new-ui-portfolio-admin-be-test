const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// -----------------------------------------

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("AUTH HEADER:", req.headers.authorization);
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const token = authHeader.split(" ")[1];

        // JWT verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User find by id from token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Optional: check email specifically (for portfolio admin)
        if (user.email !== process.env.DBSEEDUSERID) {
            return res.status(403).json({ message: "You are not authorized" });
        }

        // Attach user to request for next middleware / route
        req.user = user;
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
