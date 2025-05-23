/*
const admin = require("../config/firebase-config");

class Middleware {
    async decodeToken(req, res, next) {
        let token;
        if (req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token || token == "Bearer") {
            return res.status(401).json({ message: "Firebase ID token not provided" });
        }

        try {
            const decodeValue = await admin.auth().verifyIdToken(token);
            if (decodeValue) {
                req.user = decodeValue; // Attach user info to request
                return next();
            }
            return res.status(403).json({ message: "Unauthorized access" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new Middleware();

*/