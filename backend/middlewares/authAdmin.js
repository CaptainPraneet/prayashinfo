import jwt from "jsonwebtoken"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const rawToken = req.headers.atoken || req.headers.authorization;
        if (!rawToken) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Please login as Admin.' });
        }
        const atoken = rawToken.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
        
        const isSecureAdmin = decoded && typeof decoded === 'object' && decoded.role === 'admin';
        const isLegacyAdmin = decoded === (process.env.ADMIN_EMAIL || "admin@appointy.com") + (process.env.ADMIN_PASSWORD || "qwerty123");

        if (!isSecureAdmin && !isLegacyAdmin) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Invalid Admin Token.' });
        }
        req.admin = { email: decoded.email || process.env.ADMIN_EMAIL };
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error.message);
        res.status(401).json({ success: false, message: 'Session expired or invalid. Please login again.' });
    }
};

export default authAdmin;