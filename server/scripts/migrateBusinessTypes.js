// scripts/migrateBusinessTypes.js
//
// Backfills the new `business_types` field on existing admins.
//
// Rules:
//   - Super-admins are skipped (they have implicit full access).
//   - Every other admin gets 'Maulshree' (they were main-CRM admins before),
//     plus 'Mukhwas'/'Breeliq' derived from their existing sales_permissions.
//   - Idempotent: admins that already have business_types are left untouched.
//
// Run once after deploy:  node scripts/migrateBusinessTypes.js
import mongoose from "mongoose";
import Admin from "../models/adminModel.js";
import dotenv from "dotenv";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const admins = await Admin.find({ role: { $ne: "super-admin" } });
        let updated = 0;

        for (const admin of admins) {
            if (admin.business_types && admin.business_types.length > 0) {
                continue; // already migrated
            }

            const types = ["Maulshree"];
            const sp = admin.sales_permissions || [];
            if (sp.includes("manage_mukhwas_sales")) types.push("Mukhwas");
            if (sp.includes("manage_breeliq_sales")) types.push("Breeliq");

            admin.business_types = types;
            await admin.save(); // pre-save hook re-derives sales_permissions
            updated++;
            console.log(`  ${admin.username}: ${types.join(", ")}`);
        }

        console.log(`\nMigration complete. ${updated} admin(s) updated, ${admins.length - updated} skipped.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
