// routes/salesRoutes.js
import express from "express";
import { 
    addSalesEntry, 
    getSalesEntries, 
    updateMonthlyTarget, 
    getMonthlyTarget, 
    getSalesAnalytics,
    getAllSalesDataForReport
} from "../controllers/salesController.js";
import { protectAdmin, canManageBrandSales } from "../middlewares/adminAuth.js";

const salesRouter = express.Router();

// All sales routes require admin authentication
salesRouter.use(protectAdmin);

salesRouter.post("/entry", canManageBrandSales, addSalesEntry);
salesRouter.get("/entries", canManageBrandSales, getSalesEntries);
salesRouter.post("/target", canManageBrandSales, updateMonthlyTarget);
salesRouter.get("/target", canManageBrandSales, getMonthlyTarget);
salesRouter.get("/analytics", canManageBrandSales, getSalesAnalytics);
salesRouter.get("/report-data", getAllSalesDataForReport);

export default salesRouter;
