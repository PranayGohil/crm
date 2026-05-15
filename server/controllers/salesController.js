// controllers/salesController.js
import SalesEntry from "../models/salesEntryModel.js";
import MonthlyTarget from "../models/monthlyTargetModel.js";
import mongoose from "mongoose";

// Add daily sales entry
export const addSalesEntry = async (req, res) => {
    try {
        const { brand, amount, date, notes } = req.body || {};

        if (!brand || !amount || !date) {
            return res.status(400).json({ success: false, message: "Brand, amount and date are required" });
        }

        const newEntry = new SalesEntry({
            brand,
            amount: Number(amount),
            date: new Date(date),
            notes,
            created_by: req.admin._id
        });

        await newEntry.save();

        res.status(201).json({ success: true, message: "Sales entry added successfully", entry: newEntry });
    } catch (err) {
        console.error("Add sales entry error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get sales entries for a brand and month
export const getSalesEntries = async (req, res) => {
    try {
        const { brand, month, year, page = 1, limit = 10 } = req.query || {};

        if (!brand) return res.status(400).json({ success: false, message: "Brand is required" });

        const query = { brand };

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, Number(month) + 1, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const skip = (Number(page) - 1) * Number(limit);
        
        const entries = await SalesEntry.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('created_by', 'username');

        const total = await SalesEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            entries,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (err) {
        console.error("Get sales entries error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update monthly target
export const updateMonthlyTarget = async (req, res) => {
    try {
        const { brand, month, year, target_amount } = req.body || {};

        if (brand === undefined || month === undefined || year === undefined || target_amount === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const target = await MonthlyTarget.findOneAndUpdate(
            { brand, month, year },
            { target_amount: Number(target_amount), updated_by: req.admin._id },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Monthly target updated", target });
    } catch (err) {
        console.error("Update monthly target error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get monthly target
export const getMonthlyTarget = async (req, res) => {
    try {
        const { brand, month, year } = req.query || {};
        const target = await MonthlyTarget.findOne({ brand, month, year });
        res.status(200).json({ success: true, target: target || { target_amount: 0 } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get sales analytics
export const getSalesAnalytics = async (req, res) => {
    try {
        const { brand, month, year } = req.query || {};

        if (!brand || month === undefined || year === undefined) {
            return res.status(400).json({ success: false, message: "Brand, month and year are required" });
        }

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, Number(month) + 1, 0, 23, 59, 59);

        // 1. Get total achieved sales for the month
        const salesData = await SalesEntry.aggregate([
            {
                $match: {
                    brand,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAchieved: { $sum: "$amount" },
                    avgDaily: { $avg: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const achieved = salesData.length > 0 ? salesData[0].totalAchieved : 0;
        const avgDaily = salesData.length > 0 ? salesData[0].avgDaily : 0;

        // 2. Get target for the month
        const targetDoc = await MonthlyTarget.findOne({ brand, month, year });
        const target = targetDoc ? targetDoc.target_amount : 0;

        // 3. Calculate metrics
        const remaining = Math.max(0, target - achieved);
        const percentage = target > 0 ? Math.round((achieved / target) * 100) : 0;

        res.status(200).json({
            success: true,
            analytics: {
                achieved,
                target,
                remaining,
                percentage,
                avgDaily: Math.round(avgDaily * 100) / 100
            }
        });
    } catch (err) {
        console.error("Get sales analytics error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// Get all sales data for global reporting
export const getAllSalesDataForReport = async (req, res) => {
    try {
        const isSuper = req.admin.role === 'super-admin';
        const allowedBrands = ['Maulshree']; // Maulshree is the default brand

        if (isSuper) {
            allowedBrands.push('Mukhwas', 'Breeliq');
        } else {
            if (req.admin.sales_permissions?.includes('manage_mukhwas_sales')) allowedBrands.push('Mukhwas');
            if (req.admin.sales_permissions?.includes('manage_breeliq_sales')) allowedBrands.push('Breeliq');
        }

        const [entries, targets] = await Promise.all([
            SalesEntry.find({ brand: { $in: allowedBrands } }).sort({ date: -1 }).populate('created_by', 'username'),
            MonthlyTarget.find({ brand: { $in: allowedBrands } })
        ]);

        res.status(200).json({
            success: true,
            entries,
            targets
        });
    } catch (err) {
        console.error("Get all sales data error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
