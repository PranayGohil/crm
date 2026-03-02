import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const protectAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Not authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ message: "Admin not found" });

        req.admin = admin;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const superAdminOnly = (req, res, next) => {
    if (req.admin.role !== "superadmin") {
        return res.status(403).json({ message: "Super Admin access only" });
    }
    next();
};