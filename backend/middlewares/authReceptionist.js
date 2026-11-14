import jwt from "jsonwebtoken";

const authReceptionist = async (req, res, next) => {
    try {
        const token = req.headers.rtoken || req.headers.atoken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ success: false, message: "Authorization token missing" });
        }

        // Allow Admin token to access receptionist endpoints
        if (token === jwt.sign(process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD, process.env.JWT_SECRET)) {
            req.user = { role: 'admin' };
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'receptionist' || decoded.role === 'admin') {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ success: false, message: "Access restricted to receptionists and admins" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired session" });
    }
};

export default authReceptionist;
