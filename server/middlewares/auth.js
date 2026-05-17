// middlewares/auth.js
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Employee from "../models/employeeModel.js";
import Client from "../models/clientModel.js";

export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(400).json({
            success: false,
            message: "Invalid token"
        });
    }
};

export const protectAny = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Not authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check Admin
        let user = await Admin.findById(decoded.id);
        if (user) {
            req.user = user;
            req.admin = user; // Set req.admin for compatibility
            req.isAdmin = true;
            return next();
        }

        // Check Employee
        user = await Employee.findById(decoded.id);
        if (user) {
            user.role = "employee";
            req.user = user;
            req.employee = user; // Set req.employee for clarity
            req.isAdmin = false;
            return next();
        }

        // Check Client
        user = await Client.findById(decoded.id);
        if (user) {
            user.role = "client";
            req.user = user;
            req.client = user; // Set req.client for clarity
            req.isAdmin = false;
            return next();
        }

        return res.status(401).json({ message: "User not found" });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};