// models/salesEntryModel.js
import mongoose from "mongoose";

const salesEntrySchema = new mongoose.Schema({
    brand: {
        type: String,
        enum: ['Mukhwas', 'Breeliq'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0']
    },
    date: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

// Add indexes for common queries
salesEntrySchema.index({ brand: 1, date: -1 }, { name: "idx_sales_brand_date" });
salesEntrySchema.index({ created_by: 1 }, { name: "idx_sales_created_by" });

const SalesEntry = mongoose.model("SalesEntry", salesEntrySchema);
export default SalesEntry;
