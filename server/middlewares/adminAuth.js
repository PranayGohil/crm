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
        req.user = admin; // keep req.user/req.admin consistent (matches protectAny)
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const superAdminOnly = (req, res, next) => {
    if (req.admin.role !== "super-admin") {
        return res.status(403).json({ message: "Super Admin access only" });
    }
    next();
};

// Gate Maulshree (main CRM) endpoints. Super-admins always pass; other admins
// must have 'Maulshree' in their business_types. Reads the full admin doc from
// protectAdmin/protectAny (req.admin) or falls back to the JWT payload (req.user).
export const requireMaulshree = (req, res, next) => {
    const actor = req.admin || req.user;
    if (!actor) return res.status(401).json({ message: "Not authorized" });

    if (actor.role === "super-admin") return next();

    const types = actor.business_types || [];

    if (types.length > 0) {
        if (types.includes("Maulshree")) return next();
        return res.status(403).json({ message: "Access denied. Maulshree access required." });
    }

    // Legacy fallback (business_types not set yet): an admin with sales
    // permissions is sales-only; one without is a legacy main-CRM admin.
    const sp = actor.sales_permissions || [];
    if (sp.length === 0) return next();

    return res.status(403).json({ message: "Access denied. Maulshree access required." });
};

export const canManageBrandSales = (req, res, next) => {
    const brand = req.body?.brand || req.query?.brand;
    if (!brand) return res.status(400).json({ success: false, message: "Brand is required" });

    if (req.admin.role === "super-admin") return next();

    const permission = brand === "Mukhwas" ? "manage_mukhwas_sales" : "manage_breeliq_sales";
    if (req.admin.sales_permissions && req.admin.sales_permissions.includes(permission)) {
        return next();
    }

    res.status(403).json({ message: `Access denied. You don't have permission to manage ${brand} sales.` });
};