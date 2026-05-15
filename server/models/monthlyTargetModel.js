// models/monthlyTargetModel.js
import mongoose from "mongoose";

const monthlyTargetSchema = new mongoose.Schema({
    brand: {
        type: String,
        enum: ['Mukhwas', 'Breeliq'],
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 0,
        max: 11
    },
    year: {
        type: Number,
        required: true
    },
    target_amount: {
        type: Number,
        required: true,
        default: 0
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

// Ensure unique target per brand/month/year
monthlyTargetSchema.index({ brand: 1, month: 1, year: 1 }, { unique: true, name: "idx_target_unique_month" });

const MonthlyTarget = mongoose.model("MonthlyTarget", monthlyTargetSchema);
export default MonthlyTarget;
